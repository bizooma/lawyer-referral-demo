-- Enable realtime for referral_responses and intakes tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.intakes;

-- Set replica identity for full row data in realtime updates
ALTER TABLE public.referral_responses REPLICA IDENTITY FULL;
ALTER TABLE public.intakes REPLICA IDENTITY FULL;

-- Allow INSERT and UPDATE on referral_responses for demo (public access since this is a demo)
CREATE POLICY "Demo users can insert referral responses"
ON public.referral_responses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Demo users can update referral responses"
ON public.referral_responses FOR UPDATE
USING (true);

-- Allow UPDATE on intakes for status changes in demo
CREATE POLICY "Demo users can update intakes"
ON public.intakes FOR UPDATE
USING (true);