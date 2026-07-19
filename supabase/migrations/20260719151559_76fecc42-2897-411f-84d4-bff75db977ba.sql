
-- Phase 2 workflow: attorney compliance fields, referral RPCs, intake gating

-- Attorney compliance/matching fields
ALTER TABLE public.attorneys
  ADD COLUMN IF NOT EXISTS max_active_referrals int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS years_experience int,
  ADD COLUMN IF NOT EXISTS insurance_carrier text,
  ADD COLUMN IF NOT EXISTS insurance_coverage_amount numeric,
  ADD COLUMN IF NOT EXISTS in_good_standing boolean NOT NULL DEFAULT true;

-- Add 'closed' to referral_status if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid WHERE t.typname='referral_status' AND e.enumlabel='closed') THEN
    ALTER TYPE public.referral_status ADD VALUE 'closed';
  END IF;
END $$;

-- Active referral count helper
CREATE OR REPLACE FUNCTION public.attorney_active_referral_count(_attorney_id uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT count(*)::int FROM public.intakes
  WHERE assigned_attorney_id = _attorney_id AND status IN ('matched','referred');
$$;

-- Create intake with compliance gate
CREATE OR REPLACE FUNCTION public.create_intake(
  _org_id uuid,
  _caller_name text,
  _caller_phone text,
  _caller_email text,
  _area_of_law practice_area,
  _county text,
  _language_preference text,
  _narrative text,
  _urgency text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _uid uuid := auth.uid();
  _id uuid;
  _num text;
  _is_demo boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_org_member(_uid, _org_id) THEN RAISE EXCEPTION 'Not a member of this organization'; END IF;

  SELECT is_demo INTO _is_demo FROM public.organizations WHERE id=_org_id;
  IF NOT COALESCE(_is_demo,false) AND NOT public.org_is_compliance_ready(_org_id) THEN
    RAISE EXCEPTION 'Compliance profile must be attested before creating intakes';
  END IF;

  _num := 'INT-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);

  INSERT INTO public.intakes (
    organization_id, intake_number, client_id, caller_name, caller_phone, caller_email,
    area_of_law, county, language_preference, narrative, urgency, status
  ) VALUES (
    _org_id, _num, _num, _caller_name, _caller_phone, _caller_email,
    _area_of_law, _county, COALESCE(_language_preference,'English'), _narrative,
    COALESCE(_urgency,'normal'), 'new'
  ) RETURNING id INTO _id;

  INSERT INTO public.audit_logs (organization_id, intake_id, action, details, performed_by)
  VALUES (_org_id, _id, 'intake_created', jsonb_build_object('intake_number',_num), _uid::text);

  RETURN _id;
END;
$$;

-- Send referral atomically
CREATE OR REPLACE FUNCTION public.send_referral(_intake_id uuid, _attorney_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _uid uuid := auth.uid();
  _org_id uuid;
  _att_org uuid;
  _ref_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT organization_id INTO _org_id FROM public.intakes WHERE id=_intake_id;
  SELECT organization_id INTO _att_org FROM public.attorneys WHERE id=_attorney_id;
  IF _org_id IS NULL OR _org_id <> _att_org THEN
    RAISE EXCEPTION 'Intake and attorney must belong to the same organization';
  END IF;
  IF NOT public.is_org_member(_uid, _org_id) THEN
    RAISE EXCEPTION 'Not a member of this organization';
  END IF;

  INSERT INTO public.referral_responses (intake_id, attorney_id, status, organization_id)
  VALUES (_intake_id, _attorney_id, 'pending', _org_id)
  RETURNING id INTO _ref_id;

  UPDATE public.intakes
     SET status='referred', assigned_attorney_id=_attorney_id, referral_sent_at=now()
   WHERE id=_intake_id;

  UPDATE public.attorneys SET last_assigned_date=now() WHERE id=_attorney_id;

  INSERT INTO public.audit_logs (organization_id, intake_id, attorney_id, action, details, performed_by)
  VALUES (_org_id, _intake_id, _attorney_id, 'referral_sent', jsonb_build_object('referral_id', _ref_id), _uid::text);

  RETURN _ref_id;
END;
$$;

-- Update referral outcome
CREATE OR REPLACE FUNCTION public.update_referral_outcome(
  _referral_id uuid, _status referral_status, _notes text DEFAULT NULL, _close_intake boolean DEFAULT false
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _uid uuid := auth.uid();
  _org_id uuid;
  _intake_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT organization_id, intake_id INTO _org_id, _intake_id FROM public.referral_responses WHERE id=_referral_id;
  IF _org_id IS NULL THEN RAISE EXCEPTION 'Referral not found'; END IF;
  IF NOT public.is_org_member(_uid, _org_id) THEN RAISE EXCEPTION 'Not a member of this organization'; END IF;

  UPDATE public.referral_responses
     SET status=_status, notes=COALESCE(_notes,notes), response_date=now()
   WHERE id=_referral_id;

  IF _status = 'declined' THEN
    UPDATE public.intakes SET status='pending_match', assigned_attorney_id=NULL WHERE id=_intake_id;
  ELSIF _status = 'closed' OR _close_intake THEN
    UPDATE public.intakes SET status='closed' WHERE id=_intake_id;
  END IF;

  INSERT INTO public.audit_logs (organization_id, intake_id, action, details, performed_by)
  VALUES (_org_id, _intake_id, 'referral_outcome',
    jsonb_build_object('referral_id',_referral_id,'status',_status,'notes',_notes), _uid::text);
END;
$$;

REVOKE ALL ON FUNCTION public.create_intake(uuid,text,text,text,practice_area,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_intake(uuid,text,text,text,practice_area,text,text,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.send_referral(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_referral(uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.update_referral_outcome(uuid,referral_status,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_referral_outcome(uuid,referral_status,text,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attorney_active_referral_count(uuid) TO authenticated;

-- Ensure matching_rules updateable by admins for weight edits (assume existing policies already allow)
