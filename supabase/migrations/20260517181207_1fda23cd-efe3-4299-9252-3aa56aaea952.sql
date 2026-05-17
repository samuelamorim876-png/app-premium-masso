CREATE TABLE IF NOT EXISTS public.access_request_notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_request_id uuid NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'telegram',
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  last_error text,
  provider_status integer,
  provider_response text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_request_notification_queue_provider_check CHECK (provider IN ('telegram')),
  CONSTRAINT access_request_notification_queue_status_check CHECK (status IN ('pending', 'retrying', 'sending', 'sent', 'failed')),
  CONSTRAINT access_request_notification_queue_attempt_count_check CHECK (attempt_count >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS access_request_notification_queue_unique_provider
  ON public.access_request_notification_queue(access_request_id, provider);

CREATE INDEX IF NOT EXISTS access_request_notification_queue_pending_idx
  ON public.access_request_notification_queue(status, next_attempt_at)
  WHERE status IN ('pending', 'retrying', 'failed');

ALTER TABLE public.access_request_notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view access notification queue" ON public.access_request_notification_queue;
CREATE POLICY "Admins can view access notification queue"
ON public.access_request_notification_queue
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_access_request_notification_queue_updated_at ON public.access_request_notification_queue;
CREATE TRIGGER update_access_request_notification_queue_updated_at
BEFORE UPDATE ON public.access_request_notification_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();