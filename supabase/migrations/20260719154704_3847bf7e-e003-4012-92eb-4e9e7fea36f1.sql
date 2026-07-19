
-- Replace the force-pending trigger with logic that auto-activates platform subdomains
CREATE OR REPLACE FUNCTION public.organization_domains_set_initial_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.domain_type = 'subdomain'
     AND lower(NEW.hostname) LIKE '%.lawyerreferralprogram.com' THEN
    NEW.status := 'active';
    NEW.ssl_status := 'active';
  ELSE
    NEW.status := 'pending';
    NEW.ssl_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organization_domains_force_pending ON public.organization_domains;
DROP TRIGGER IF EXISTS trg_organization_domains_set_initial_status ON public.organization_domains;
CREATE TRIGGER trg_organization_domains_set_initial_status
BEFORE INSERT ON public.organization_domains
FOR EACH ROW EXECUTE FUNCTION public.organization_domains_set_initial_status();

-- Internal helper: marks a domain active after DNS TXT verification.
-- Called by the verify-domain edge function (service role). Not exposed to clients.
CREATE OR REPLACE FUNCTION public.mark_domain_verified(_domain_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
BEGIN
  SELECT organization_id INTO _org_id FROM public.organization_domains WHERE id = _domain_id;
  IF _org_id IS NULL THEN RAISE EXCEPTION 'Domain not found'; END IF;

  UPDATE public.organization_domains
     SET status = 'active',
         last_checked_at = now()
   WHERE id = _domain_id;

  INSERT INTO public.audit_logs (organization_id, action, details, performed_by)
  VALUES (_org_id, 'domain_verified',
          jsonb_build_object('domain_id', _domain_id), 'system');
END;
$$;

REVOKE ALL ON FUNCTION public.mark_domain_verified(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_domain_verified(uuid) TO service_role;

-- Helper to record a failed check (for UI feedback)
CREATE OR REPLACE FUNCTION public.mark_domain_check(_domain_id uuid, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.organization_domains
     SET status = _status,
         last_checked_at = now()
   WHERE id = _domain_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_domain_check(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_domain_check(uuid, text) TO service_role;
