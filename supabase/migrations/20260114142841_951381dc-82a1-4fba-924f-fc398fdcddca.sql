-- Allow INSERT on audit_logs for demo logging
CREATE POLICY "Demo users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);