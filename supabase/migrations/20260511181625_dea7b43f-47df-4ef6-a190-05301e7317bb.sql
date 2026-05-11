CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  provider text,
  event_type text,
  email text,
  user_id uuid,
  action text,
  status text NOT NULL DEFAULT 'received',
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text
);

ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs"
ON public.payment_webhook_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));