
-- Part 1: Close cross-tenant leak, scope public access to demo org only

CREATE OR REPLACE FUNCTION public.is_demo_org(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.organizations WHERE id = _org_id AND is_demo = true)
$$;

-- attorneys
DROP POLICY IF EXISTS "Attorneys are publicly readable" ON public.attorneys;
CREATE POLICY "Demo org attorneys are public" ON public.attorneys
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(organization_id));

-- intakes
DROP POLICY IF EXISTS "Intakes are publicly readable" ON public.intakes;
DROP POLICY IF EXISTS "Demo users can update intakes" ON public.intakes;
CREATE POLICY "Demo org intakes are public read" ON public.intakes
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(organization_id));
CREATE POLICY "Demo org intakes public insert" ON public.intakes
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_demo_org(organization_id));
CREATE POLICY "Demo org intakes public update" ON public.intakes
  FOR UPDATE TO anon, authenticated
  USING (public.is_demo_org(organization_id))
  WITH CHECK (public.is_demo_org(organization_id));

-- referral_responses
DROP POLICY IF EXISTS "Referral responses are publicly readable" ON public.referral_responses;
DROP POLICY IF EXISTS "Demo users can insert referral responses" ON public.referral_responses;
DROP POLICY IF EXISTS "Demo users can update referral responses" ON public.referral_responses;
CREATE POLICY "Demo org referral_responses public read" ON public.referral_responses
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(organization_id));
CREATE POLICY "Demo org referral_responses public insert" ON public.referral_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_demo_org(organization_id));
CREATE POLICY "Demo org referral_responses public update" ON public.referral_responses
  FOR UPDATE TO anon, authenticated
  USING (public.is_demo_org(organization_id))
  WITH CHECK (public.is_demo_org(organization_id));

-- matching_rules
DROP POLICY IF EXISTS "Matching rules are publicly readable" ON public.matching_rules;
CREATE POLICY "Demo org matching_rules are public" ON public.matching_rules
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(organization_id));

-- organization_settings (id = organization id)
DROP POLICY IF EXISTS "Organization settings are publicly readable" ON public.organization_settings;
CREATE POLICY "Demo org organization_settings are public" ON public.organization_settings
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(id));

-- audit_logs
DROP POLICY IF EXISTS "Audit logs are publicly readable" ON public.audit_logs;
DROP POLICY IF EXISTS "Demo users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Demo org audit_logs are public read" ON public.audit_logs
  FOR SELECT TO anon, authenticated
  USING (public.is_demo_org(organization_id));
CREATE POLICY "Demo org audit_logs public insert" ON public.audit_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_demo_org(organization_id));

-- attorney_profiles (linked via attorneys.organization_id)
DROP POLICY IF EXISTS "Attorney profiles are publicly readable" ON public.attorney_profiles;
CREATE POLICY "Demo org attorney_profiles are public" ON public.attorney_profiles
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attorneys a
    WHERE a.id = attorney_profiles.attorney_id
      AND public.is_demo_org(a.organization_id)
  ));
-- Authenticated org-member access via the joined attorney
CREATE POLICY "Org members view attorney_profiles" ON public.attorney_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attorneys a
    WHERE a.id = attorney_profiles.attorney_id
      AND public.is_org_member(auth.uid(), a.organization_id)
  ));

-- client_profiles (demo-only table today)
DROP POLICY IF EXISTS "Client profiles are publicly readable" ON public.client_profiles;
CREATE POLICY "Demo client_profiles are public" ON public.client_profiles
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.demo_users du WHERE du.id = client_profiles.demo_user_id));

-- demo_users (entire table is demo seed data)
DROP POLICY IF EXISTS "Demo data is publicly readable" ON public.demo_users;
CREATE POLICY "Demo users are public read" ON public.demo_users
  FOR SELECT TO anon, authenticated
  USING (true);

-- Part 2: Signup privilege escalation fix

-- Drop client-writable INSERT on organizations
DROP POLICY IF EXISTS "Anyone authenticated can create an organization" ON public.organizations;

-- Revoke direct INSERT on user_roles from clients (there is no INSERT RLS policy either)
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.organizations FROM anon, authenticated;

-- Also ensure no stray INSERT policy exists on user_roles that would let a user pick org
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='user_roles' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_roles', r.policyname);
  END LOOP;
END $$;

-- SECURITY DEFINER RPC: create org + grant caller program_admin atomically
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  _name text,
  _slug text,
  _contact_email text DEFAULT NULL,
  _plan_tier text DEFAULT 'local_bar'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _org_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _name IS NULL OR length(trim(_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name required';
  END IF;

  INSERT INTO public.organizations (name, slug, contact_email, plan_tier, is_demo)
  VALUES (trim(_name), _slug, _contact_email, COALESCE(_plan_tier,'local_bar'), false)
  RETURNING id INTO _org_id;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (_uid, _org_id, 'program_admin');

  RETURN _org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization_with_admin(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization_with_admin(text, text, text, text) TO authenticated;

-- Part 3: Stop fake domain verification — no auto-activation
-- Force new domain rows to start pending regardless of client input
ALTER TABLE public.organization_domains
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.organization_domains_force_pending()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  NEW.ssl_status := COALESCE(NEW.ssl_status, 'pending');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_org_domains_force_pending ON public.organization_domains;
CREATE TRIGGER trg_org_domains_force_pending
  BEFORE INSERT ON public.organization_domains
  FOR EACH ROW EXECUTE FUNCTION public.organization_domains_force_pending();
