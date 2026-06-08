
-- Extend organizations with more branding fields
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS support_url text,
  ADD COLUMN IF NOT EXISTS widget_intro text;

-- Per-org domains (subdomain + custom vanity domains)
CREATE TABLE IF NOT EXISTS public.organization_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  hostname text NOT NULL UNIQUE,
  domain_type text NOT NULL CHECK (domain_type IN ('subdomain','custom')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verifying','active','failed')),
  verification_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_primary boolean NOT NULL DEFAULT false,
  ssl_status text NOT NULL DEFAULT 'pending',
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_domains TO authenticated;
GRANT ALL ON public.organization_domains TO service_role;

ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their org domains"
  ON public.organization_domains FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins insert org domains"
  ON public.organization_domains FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE POLICY "Admins update org domains"
  ON public.organization_domains FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'program_admin'))
  WITH CHECK (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE POLICY "Admins delete org domains"
  ON public.organization_domains FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'program_admin'));

CREATE TRIGGER set_organization_domains_updated_at
  BEFORE UPDATE ON public.organization_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public branding lookup for embeddable widget / tenant landing pages
CREATE OR REPLACE FUNCTION public.get_branding_by_host(_host text)
RETURNS TABLE (
  organization_id uuid,
  name text,
  logo_url text,
  favicon_url text,
  primary_color text,
  accent_color text,
  disclaimer_text text,
  contact_email text,
  contact_phone text,
  support_url text,
  widget_intro text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.name, o.logo_url, o.favicon_url, o.primary_color, o.accent_color,
         o.disclaimer_text, o.contact_email, o.contact_phone, o.support_url, o.widget_intro
  FROM public.organizations o
  JOIN public.organization_domains d ON d.organization_id = o.id
  WHERE lower(d.hostname) = lower(_host) AND d.status = 'active'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_branding_by_host(text) TO anon, authenticated;

-- Storage policies for org-branding bucket
CREATE POLICY "Anyone can view org branding files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-branding');

CREATE POLICY "Org admins can upload branding"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'org-branding'
    AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'program_admin')
  );

CREATE POLICY "Org admins can update branding"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'org-branding'
    AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'program_admin')
  );

CREATE POLICY "Org admins can delete branding"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'org-branding'
    AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'program_admin')
  );
