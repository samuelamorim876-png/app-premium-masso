ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS permission_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS fcm_endpoint boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_saved_at timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_received_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_error text;

CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  notification_type text NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  target_endpoint text,
  status text NOT NULL DEFAULT 'queued',
  provider text NOT NULL DEFAULT 'web_push',
  provider_status integer,
  provider_response text,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_notification_logs' AND policyname = 'Admins can view push logs'
  ) THEN
    CREATE POLICY "Admins can view push logs"
    ON public.push_notification_logs
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_notification_logs' AND policyname = 'System can create push logs'
  ) THEN
    CREATE POLICY "System can create push logs"
    ON public.push_notification_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_new_access_request ON public.access_requests;
CREATE TRIGGER on_new_access_request
AFTER INSERT ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_access_request();