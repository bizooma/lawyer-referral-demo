
-- ============================================================
-- 1. Attorney ↔ auth user link
-- ============================================================
ALTER TABLE public.attorneys
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS attorneys_user_id_key
  ON public.attorneys(user_id) WHERE user_id IS NOT NULL;

-- ============================================================
-- 2. Invites table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attorney_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  attorney_id uuid NOT NULL REFERENCES public.attorneys(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attorney_invites TO authenticated;
GRANT ALL ON public.attorney_invites TO service_role;

ALTER TABLE public.attorney_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program admins view org invites"
  ON public.attorney_invites FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'program_admin'));

-- (Writes are done only via SECURITY DEFINER RPCs below; no direct INSERT/UPDATE policies.)

-- ============================================================
-- 3. Helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_org_staff(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND organization_id = _org_id
      AND role IN ('program_admin','intake_specialist')
  )
$$;

CREATE OR REPLACE FUNCTION public.my_attorney_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.attorneys WHERE user_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.is_org_staff(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_attorney_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_staff(uuid,uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_attorney_ids() TO authenticated, service_role;

-- ============================================================
-- 4. Rewrite policies so attorneys can't peek at staff data
-- ============================================================

-- attorneys: staff can see all in org; attorney sees own row; admins manage
DROP POLICY IF EXISTS "Org members can view their attorneys" ON public.attorneys;
CREATE POLICY "Staff can view org attorneys"
  ON public.attorneys FOR SELECT TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id));
CREATE POLICY "Attorney can view own record"
  ON public.attorneys FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- intakes: staff manage; attorney sees only intakes assigned to them
DROP POLICY IF EXISTS "Org members can view their intakes" ON public.intakes;
DROP POLICY IF EXISTS "Org members can manage their intakes" ON public.intakes;
CREATE POLICY "Staff manage org intakes"
  ON public.intakes FOR ALL TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id))
  WITH CHECK (public.is_org_staff(auth.uid(), organization_id));
CREATE POLICY "Attorney views assigned intakes"
  ON public.intakes FOR SELECT TO authenticated
  USING (assigned_attorney_id IN (SELECT public.my_attorney_ids()));

-- referral_responses: staff manage; attorney views + updates own
DROP POLICY IF EXISTS "Org members can view referral responses" ON public.referral_responses;
DROP POLICY IF EXISTS "Org members can manage referral responses" ON public.referral_responses;
CREATE POLICY "Staff manage org referrals"
  ON public.referral_responses FOR ALL TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id))
  WITH CHECK (public.is_org_staff(auth.uid(), organization_id));
CREATE POLICY "Attorney views own referrals"
  ON public.referral_responses FOR SELECT TO authenticated
  USING (attorney_id IN (SELECT public.my_attorney_ids()));

-- audit_logs: staff only
DROP POLICY IF EXISTS "Org members can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Org members can insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff view org audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id));
CREATE POLICY "Staff insert org audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_org_staff(auth.uid(), organization_id));

-- matching_rules
DROP POLICY IF EXISTS "Org members can view matching rules" ON public.matching_rules;
CREATE POLICY "Staff view matching rules"
  ON public.matching_rules FOR SELECT TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id));

-- compliance profile
DROP POLICY IF EXISTS "Org members can view their compliance profile" ON public.org_compliance_profiles;
CREATE POLICY "Staff view compliance profile"
  ON public.org_compliance_profiles FOR SELECT TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id));

-- domains
DROP POLICY IF EXISTS "Members view their org domains" ON public.organization_domains;
CREATE POLICY "Staff view org domains"
  ON public.organization_domains FOR SELECT TO authenticated
  USING (public.is_org_staff(auth.uid(), organization_id));

-- attorney_profiles (demo table): keep staff-scoped
DROP POLICY IF EXISTS "Org members view attorney_profiles" ON public.attorney_profiles;
CREATE POLICY "Staff view attorney_profiles"
  ON public.attorney_profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attorneys a
                 WHERE a.id = attorney_profiles.attorney_id
                   AND public.is_org_staff(auth.uid(), a.organization_id)));

-- user_roles: user sees own row; staff sees all in their org (attorneys don't see peers)
DROP POLICY IF EXISTS "Users can view roles in their orgs" ON public.user_roles;
CREATE POLICY "Users view own or org staff view all"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_staff(auth.uid(), organization_id));

-- Organizations SELECT stays as-is (attorney needs to see own org name/branding).

-- ============================================================
-- 5. Invite RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_attorney_invite(_attorney_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _org uuid;
  _email text;
  _has_user uuid;
  _token text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT organization_id, email, user_id INTO _org, _email, _has_user
    FROM public.attorneys WHERE id = _attorney_id;
  IF _org IS NULL THEN RAISE EXCEPTION 'Attorney not found'; END IF;
  IF NOT public.has_role(_uid, _org, 'program_admin') THEN
    RAISE EXCEPTION 'Only program admins can invite attorneys';
  END IF;
  IF _has_user IS NOT NULL THEN
    RAISE EXCEPTION 'Attorney already linked to an account';
  END IF;

  _token := encode(gen_random_bytes(24), 'hex');

  INSERT INTO public.attorney_invites (organization_id, attorney_id, email, token, created_by)
  VALUES (_org, _attorney_id, lower(_email), _token, _uid);

  RETURN _token;
END; $$;

CREATE OR REPLACE FUNCTION public.accept_attorney_invite(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _user_email text;
  _inv record;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT email INTO _user_email FROM auth.users WHERE id = _uid;

  SELECT * INTO _inv FROM public.attorney_invites WHERE token = _token;
  IF _inv.id IS NULL THEN RAISE EXCEPTION 'Invalid invite'; END IF;
  IF _inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Invite already used'; END IF;
  IF _inv.expires_at < now() THEN RAISE EXCEPTION 'Invite expired'; END IF;
  IF lower(_user_email) <> lower(_inv.email) THEN
    RAISE EXCEPTION 'This invite was sent to a different email address';
  END IF;

  -- Link auth user to the attorney record
  UPDATE public.attorneys
     SET user_id = _uid
   WHERE id = _inv.attorney_id AND user_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Attorney record already claimed'; END IF;

  -- Grant attorney role scoped to that org (idempotent)
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (_uid, _inv.organization_id, 'attorney')
  ON CONFLICT DO NOTHING;

  UPDATE public.attorney_invites
     SET accepted_at = now(), accepted_by = _uid
   WHERE id = _inv.id;

  RETURN _inv.attorney_id;
END; $$;

-- ============================================================
-- 6. Attorney self-service RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_my_attorney_profile(
  _practice_areas practice_area[] DEFAULT NULL,
  _counties text[] DEFAULT NULL,
  _languages text[] DEFAULT NULL,
  _phone text DEFAULT NULL,
  _firm_name text DEFAULT NULL,
  _max_active_referrals int DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.attorneys SET
    practice_areas = COALESCE(_practice_areas, practice_areas),
    counties = COALESCE(_counties, counties),
    languages = COALESCE(_languages, languages),
    phone = COALESCE(_phone, phone),
    firm_name = COALESCE(_firm_name, firm_name),
    max_active_referrals = COALESCE(_max_active_referrals, max_active_referrals),
    updated_at = now()
  WHERE user_id = _uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'No attorney record linked to this account'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.set_my_attorney_availability(_is_active boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.attorneys
     SET is_active = _is_active,
         capacity_status = CASE WHEN _is_active THEN capacity_status ELSE 'unavailable' END,
         updated_at = now()
   WHERE user_id = _uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'No attorney record linked to this account'; END IF;
END; $$;

-- Attorney responds to a referral (accept/decline/contacted/closed).
CREATE OR REPLACE FUNCTION public.respond_to_referral(
  _referral_id uuid, _status referral_status, _notes text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _att uuid;
  _intake uuid;
  _org uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT attorney_id, intake_id, organization_id INTO _att, _intake, _org
    FROM public.referral_responses WHERE id = _referral_id;
  IF _att IS NULL THEN RAISE EXCEPTION 'Referral not found'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.attorneys WHERE id = _att AND user_id = _uid) THEN
    RAISE EXCEPTION 'Not your referral';
  END IF;

  UPDATE public.referral_responses
     SET status = _status, notes = COALESCE(_notes, notes), response_date = now()
   WHERE id = _referral_id;

  IF _status = 'declined' THEN
    UPDATE public.intakes SET status='pending_match', assigned_attorney_id=NULL WHERE id=_intake;
  ELSIF _status = 'closed' THEN
    UPDATE public.intakes SET status='closed' WHERE id=_intake;
  END IF;

  INSERT INTO public.audit_logs (organization_id, intake_id, attorney_id, action, details, performed_by)
  VALUES (_org, _intake, _att, 'attorney_response',
    jsonb_build_object('referral_id', _referral_id, 'status', _status, 'notes', _notes), _uid::text);
END; $$;

-- ============================================================
-- 7. Lock down direct writes to attorneys by attorneys
--    (they must use RPCs; only program_admin retains ALL policy)
-- ============================================================
REVOKE ALL ON FUNCTION public.create_attorney_invite(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_attorney_invite(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_my_attorney_profile(practice_area[], text[], text[], text, text, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_my_attorney_availability(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_to_referral(uuid, referral_status, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_attorney_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_attorney_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_my_attorney_profile(practice_area[], text[], text[], text, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_attorney_availability(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_referral(uuid, referral_status, text) TO authenticated;
