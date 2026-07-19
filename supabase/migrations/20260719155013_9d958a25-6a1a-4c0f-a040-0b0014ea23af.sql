
-- Branding by slug (mirrors get_branding_by_host)
CREATE OR REPLACE FUNCTION public.get_branding_by_slug(_slug text)
RETURNS TABLE(organization_id uuid, name text, logo_url text, favicon_url text,
              primary_color text, accent_color text, disclaimer_text text,
              contact_email text, contact_phone text, support_url text, widget_intro text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT o.id, o.name, o.logo_url, o.favicon_url, o.primary_color, o.accent_color,
         o.disclaimer_text, o.contact_email, o.contact_phone, o.support_url, o.widget_intro
  FROM public.organizations o
  WHERE lower(o.slug) = lower(_slug)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_branding_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_branding_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_branding_by_host(text) TO anon, authenticated;

-- Track public submissions for rate limiting
CREATE TABLE IF NOT EXISTS public.public_intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  caller_email text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pis_org_created ON public.public_intake_submissions (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pis_email_created ON public.public_intake_submissions (caller_email, created_at DESC);
GRANT ALL ON public.public_intake_submissions TO service_role;
ALTER TABLE public.public_intake_submissions ENABLE ROW LEVEL SECURITY;
-- No policies: only accessed via SECURITY DEFINER RPC.

-- The public, anon-callable intake RPC
CREATE OR REPLACE FUNCTION public.public_create_intake(
  _host text,
  _slug text,
  _caller_name text,
  _caller_phone text,
  _caller_email text,
  _area_of_law practice_area,
  _county text,
  _language_preference text,
  _narrative text,
  _urgency text,
  _disclosures_acknowledged boolean
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
  _is_demo boolean;
  _recent_count int;
  _num text;
  _id uuid;
BEGIN
  -- Derive org server-side. Prefer active custom/subdomain, fall back to slug.
  IF _host IS NOT NULL AND length(trim(_host)) > 0 THEN
    SELECT o.id INTO _org_id
      FROM public.organizations o
      JOIN public.organization_domains d ON d.organization_id = o.id
     WHERE lower(d.hostname) = lower(_host) AND d.status = 'active'
     LIMIT 1;
  END IF;

  IF _org_id IS NULL AND _slug IS NOT NULL AND length(trim(_slug)) > 0 THEN
    SELECT id INTO _org_id FROM public.organizations WHERE lower(slug) = lower(_slug);
  END IF;

  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'Unknown organization';
  END IF;

  IF NOT COALESCE(_disclosures_acknowledged, false) THEN
    RAISE EXCEPTION 'Disclosures must be acknowledged';
  END IF;

  -- Compliance gate (demo orgs bypass so the marketing demo keeps working)
  SELECT is_demo INTO _is_demo FROM public.organizations WHERE id = _org_id;
  IF NOT COALESCE(_is_demo, false) AND NOT public.org_is_compliance_ready(_org_id) THEN
    RAISE EXCEPTION 'This referral program is not accepting intakes yet';
  END IF;

  -- Basic input validation
  IF _caller_name IS NULL OR length(trim(_caller_name)) < 2 OR length(_caller_name) > 200 THEN
    RAISE EXCEPTION 'Please provide your full name';
  END IF;
  IF _caller_email IS NULL OR _caller_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_caller_email) > 254 THEN
    RAISE EXCEPTION 'Please provide a valid email address';
  END IF;
  IF _caller_phone IS NULL OR length(regexp_replace(_caller_phone, '[^0-9]', '', 'g')) < 7 THEN
    RAISE EXCEPTION 'Please provide a valid phone number';
  END IF;
  IF _narrative IS NULL OR length(trim(_narrative)) < 10 THEN
    RAISE EXCEPTION 'Please describe your legal matter (at least a sentence)';
  END IF;
  IF length(_narrative) > 5000 THEN
    RAISE EXCEPTION 'Narrative is too long (max 5000 characters)';
  END IF;

  -- Rate limit: max 3 submissions per email per org per hour
  SELECT count(*) INTO _recent_count
    FROM public.public_intake_submissions
   WHERE organization_id = _org_id
     AND lower(caller_email) = lower(_caller_email)
     AND created_at > now() - interval '1 hour';
  IF _recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many submissions from this email. Please try again later.';
  END IF;

  _num := 'INT-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);

  INSERT INTO public.intakes (
    organization_id, intake_number, client_id, caller_name, caller_phone, caller_email,
    area_of_law, county, language_preference, narrative, urgency, status
  ) VALUES (
    _org_id, _num, _num,
    trim(_caller_name), trim(_caller_phone), lower(trim(_caller_email)),
    _area_of_law, NULLIF(trim(_county),''),
    COALESCE(NULLIF(trim(_language_preference),''), 'English'),
    trim(_narrative), COALESCE(_urgency, 'normal'), 'new'
  ) RETURNING id INTO _id;

  INSERT INTO public.public_intake_submissions (organization_id, caller_email)
  VALUES (_org_id, lower(trim(_caller_email)));

  INSERT INTO public.audit_logs (organization_id, intake_id, action, details, performed_by)
  VALUES (_org_id, _id, 'public_intake_created',
          jsonb_build_object('intake_number', _num, 'source', 'public_portal'), 'public');

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.public_create_intake(text,text,text,text,text,practice_area,text,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_create_intake(text,text,text,text,text,practice_area,text,text,text,text,boolean) TO anon, authenticated;
