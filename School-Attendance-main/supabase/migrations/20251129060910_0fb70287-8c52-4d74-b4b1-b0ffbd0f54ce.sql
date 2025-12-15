-- Allow anyone to view guardian records (for parent portal access)
-- Note: In production, this should be secured with proper parent authentication
CREATE POLICY "Anyone can view guardians"
ON public.guardians
FOR SELECT
USING (true);