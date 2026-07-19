
-- =========================================================
-- Jurisdictions (platform reference data)
-- =========================================================
CREATE TABLE public.jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  template jsonb NOT NULL,
  template_version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.jurisdictions TO authenticated;
GRANT ALL ON public.jurisdictions TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.jurisdictions FROM anon, authenticated;

ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read jurisdictions"
  ON public.jurisdictions FOR SELECT TO authenticated USING (true);

CREATE TRIGGER jurisdictions_set_updated_at
  BEFORE UPDATE ON public.jurisdictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed four jurisdictions with conservative defaults
INSERT INTO public.jurisdictions (code, name, template) VALUES
('FL', 'Florida', jsonb_build_object(
  'fee', jsonb_build_object(
    'allowed_fee_models', jsonb_build_array('flat_membership','registration','consultation_cap'),
    'selected_fee_model', 'flat_membership',
    'consultation_fee_cap', null,
    'consultation_minutes', null,
    'percentage_rate', null,
    'flat_fee', null
  ),
  'attorney_qualification', jsonb_build_object(
    'malpractice_insurance_required', false,
    'min_coverage', null,
    'min_years_experience', null,
    'good_standing_required', true,
    'specialty_cert_required', false
  ),
  'disclosures', jsonb_build_array(
    jsonb_build_object('key','referral_not_endorsement','label','Referral disclaimer','text','[Review with counsel]','required',true)
  ),
  'panel_types', jsonb_build_array('general'),
  'extras', '{}'::jsonb,
  'review_required', true
)),
('TX', 'Texas', jsonb_build_object(
  'fee', jsonb_build_object(
    'allowed_fee_models', jsonb_build_array('flat_membership','registration','consultation_cap'),
    'selected_fee_model', 'flat_membership',
    'consultation_fee_cap', null,
    'consultation_minutes', null,
    'percentage_rate', null,
    'flat_fee', null
  ),
  'attorney_qualification', jsonb_build_object(
    'malpractice_insurance_required', false,
    'min_coverage', null,
    'min_years_experience', null,
    'good_standing_required', true,
    'specialty_cert_required', false
  ),
  'disclosures', jsonb_build_array(
    jsonb_build_object('key','referral_not_endorsement','label','Referral disclaimer','text','[Review with counsel]','required',true)
  ),
  'panel_types', jsonb_build_array('general'),
  'extras', '{}'::jsonb,
  'review_required', true
)),
('AZ', 'Arizona', jsonb_build_object(
  'fee', jsonb_build_object(
    'allowed_fee_models', jsonb_build_array('flat_membership','registration','consultation_cap'),
    'selected_fee_model', 'flat_membership',
    'consultation_fee_cap', null,
    'consultation_minutes', null,
    'percentage_rate', null,
    'flat_fee', null
  ),
  'attorney_qualification', jsonb_build_object(
    'malpractice_insurance_required', false,
    'min_coverage', null,
    'min_years_experience', null,
    'good_standing_required', true,
    'specialty_cert_required', false
  ),
  'disclosures', jsonb_build_array(
    jsonb_build_object('key','referral_not_endorsement','label','Referral disclaimer','text','[Review with counsel]','required',true)
  ),
  'panel_types', jsonb_build_array('general'),
  'extras', '{}'::jsonb,
  'review_required', true
)),
('CA', 'California', jsonb_build_object(
  'fee', jsonb_build_object(
    'allowed_fee_models', jsonb_build_array('flat_membership','registration','consultation_cap'),
    'selected_fee_model', 'flat_membership',
    'consultation_fee_cap', null,
    'consultation_minutes', null,
    'percentage_rate', null,
    'flat_fee', null
  ),
  'attorney_qualification', jsonb_build_object(
    'malpractice_insurance_required', true,
    'min_coverage', null,
    'min_years_experience', null,
    'good_standing_required', true,
    'specialty_cert_required', false
  ),
  'disclosures', jsonb_build_array(
    jsonb_build_object('key','referral_not_endorsement','label','Referral disclaimer','text','[Review with counsel]','required',true)
  ),
  'panel_types', jsonb_build_array('general'),
  'extras', '{}'::jsonb,
  'review_required', true
));

-- =========================================================
-- Org compliance profiles
-- =========================================================
CREATE TABLE public.org_compliance_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  jurisdiction_id uuid REFERENCES public.jurisdictions(id),
  config jsonb NOT NULL,
  template_version_seeded int,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','attested','needs_reattest')),
  attested_by uuid,
  attested_at timestamptz,
  attested_version int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_compliance_profiles TO authenticated;
GRANT ALL ON public.org_compliance_profiles TO service_role;

ALTER TABLE public.org_compliance_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their compliance profile"
  ON public.org_compliance_profiles FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Program admins can insert their compliance profile"
  ON public.org_compliance_profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE POLICY "Program admins can update their compliance profile"
  ON public.org_compliance_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'program_admin'))
  WITH CHECK (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE POLICY "Program admins can delete their compliance profile"
  ON public.org_compliance_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE TRIGGER org_compliance_profiles_set_updated_at
  BEFORE UPDATE ON public.org_compliance_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RPCs
-- =========================================================
CREATE OR REPLACE FUNCTION public.initialize_compliance_profile(_org_id uuid, _jurisdiction_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _template jsonb;
  _tver int;
  _new_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.has_role(_uid, _org_id, 'program_admin') THEN
    RAISE EXCEPTION 'Only program admins can initialize a compliance profile';
  END IF;
  IF EXISTS (SELECT 1 FROM public.org_compliance_profiles WHERE organization_id = _org_id) THEN
    RAISE EXCEPTION 'Compliance profile already exists for this organization';
  END IF;

  SELECT template, template_version INTO _template, _tver
  FROM public.jurisdictions WHERE id = _jurisdiction_id;

  IF _template IS NULL THEN
    RAISE EXCEPTION 'Jurisdiction not found';
  END IF;

  INSERT INTO public.org_compliance_profiles
    (organization_id, jurisdiction_id, config, template_version_seeded, status)
  VALUES
    (_org_id, _jurisdiction_id, _template, _tver, 'draft')
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.attest_compliance_profile(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.has_role(_uid, _org_id, 'program_admin') THEN
    RAISE EXCEPTION 'Only program admins can attest a compliance profile';
  END IF;

  UPDATE public.org_compliance_profiles
     SET status = 'attested',
         attested_by = _uid,
         attested_at = now(),
         attested_version = template_version_seeded
   WHERE organization_id = _org_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No compliance profile exists for this organization';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.org_is_compliance_ready(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_compliance_profiles
    WHERE organization_id = _org_id AND status = 'attested'
  )
$$;
