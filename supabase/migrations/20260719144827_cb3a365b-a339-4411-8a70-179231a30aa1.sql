
REVOKE EXECUTE ON FUNCTION public.initialize_compliance_profile(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.attest_compliance_profile(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.org_is_compliance_ready(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.initialize_compliance_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attest_compliance_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_is_compliance_ready(uuid) TO authenticated;
