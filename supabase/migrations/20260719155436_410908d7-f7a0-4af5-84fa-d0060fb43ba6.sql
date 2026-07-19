
-- 1. Plan tiers reference table
CREATE TABLE public.plan_tiers (
  code text PRIMARY KEY,
  name text NOT NULL,
  max_attorneys int,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_tiers TO authenticated, anon;
GRANT ALL ON public.plan_tiers TO service_role;
ALTER TABLE public.plan_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_tiers readable by anyone" ON public.plan_tiers
  FOR SELECT USING (true);

INSERT INTO public.plan_tiers (code, name, max_attorneys, features, sort_order) VALUES
  ('local_bar', 'Local Bar', 100, jsonb_build_object(
    'advanced_reports', false,
    'multi_county', false,
    'custom_branding', false,
    'api_access', false,
    'description', 'Basic reporting, single practice area focus, up to 100 attorneys.'
  ), 1),
  ('regional_bar', 'Regional Bar', 500, jsonb_build_object(
    'advanced_reports', true,
    'multi_county', true,
    'custom_branding', true,
    'api_access', false,
    'description', 'Advanced matching, multi-county, custom branding, up to 500 attorneys.'
  ), 2),
  ('statewide', 'Statewide', NULL, jsonb_build_object(
    'advanced_reports', true,
    'multi_county', true,
    'custom_branding', true,
    'api_access', true,
    'description', 'Unlimited attorneys, advanced analytics, API access.'
  ), 3);

-- 2. Platform admins (Bizooma staff)
CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
-- Only allow a user to see their own row (so they can self-check); no writes from client.
CREATE POLICY "see own platform_admin row" ON public.platform_admins
  FOR SELECT USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
$$;

-- 3. Block clients from changing plan_tier directly.
CREATE OR REPLACE FUNCTION public.guard_organizations_plan_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan_tier IS DISTINCT FROM OLD.plan_tier THEN
    -- Allow when running as service_role (edge functions / RPC owner path handled by SECURITY DEFINER bypass)
    IF current_setting('request.jwt.claim.role', true) IS NULL
       OR current_setting('request.jwt.claim.role', true) NOT IN ('service_role') THEN
      IF NOT public.is_platform_admin() THEN
        RAISE EXCEPTION 'plan_tier can only be changed by a platform admin via set_org_plan_tier()';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_guard_plan_tier
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.guard_organizations_plan_tier();

-- 4. RPC to set plan tier
CREATE OR REPLACE FUNCTION public.set_org_plan_tier(_org_id uuid, _tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _old text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Only platform admins can change plan tiers';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.plan_tiers WHERE code = _tier) THEN
    RAISE EXCEPTION 'Unknown plan tier: %', _tier;
  END IF;

  SELECT plan_tier INTO _old FROM public.organizations WHERE id = _org_id;
  IF _old IS NULL THEN RAISE EXCEPTION 'Organization not found'; END IF;

  UPDATE public.organizations SET plan_tier = _tier, updated_at = now() WHERE id = _org_id;

  INSERT INTO public.audit_logs (organization_id, action, details, performed_by)
  VALUES (_org_id, 'plan_tier_changed',
    jsonb_build_object('from', _old, 'to', _tier), _uid::text);
END;
$$;

-- 5. Platform admin: list all orgs
CREATE OR REPLACE FUNCTION public.list_all_orgs_for_platform()
RETURNS TABLE(id uuid, name text, slug text, plan_tier text, is_demo boolean, attorney_count bigint, created_at timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
    SELECT o.id, o.name, o.slug, o.plan_tier, o.is_demo,
           (SELECT count(*) FROM public.attorneys a WHERE a.organization_id = o.id),
           o.created_at
    FROM public.organizations o
    ORDER BY o.created_at DESC;
END;
$$;

-- 6. Attorney cap enforcement
CREATE OR REPLACE FUNCTION public.enforce_attorney_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_demo boolean;
  _tier text;
  _cap int;
  _count int;
BEGIN
  SELECT is_demo, plan_tier INTO _is_demo, _tier
    FROM public.organizations WHERE id = NEW.organization_id;

  IF COALESCE(_is_demo, false) THEN
    RETURN NEW;
  END IF;

  SELECT max_attorneys INTO _cap FROM public.plan_tiers WHERE code = _tier;
  IF _cap IS NULL THEN
    RETURN NEW; -- unlimited or unknown tier
  END IF;

  SELECT count(*) INTO _count FROM public.attorneys WHERE organization_id = NEW.organization_id;
  IF _count >= _cap THEN
    RAISE EXCEPTION 'You have reached your plan''s attorney limit (%). Contact us to upgrade.', _cap
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER attorneys_enforce_cap
  BEFORE INSERT ON public.attorneys
  FOR EACH ROW EXECUTE FUNCTION public.enforce_attorney_cap();
