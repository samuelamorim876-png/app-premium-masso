CREATE TABLE IF NOT EXISTS public.student_engagement (
  user_id uuid PRIMARY KEY,
  last_seen_at timestamptz,
  online_until timestamptz,
  total_usage_seconds integer NOT NULL DEFAULT 0,
  current_path text,
  current_module_id uuid,
  current_lesson_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  path text,
  module_id uuid,
  module_title text,
  lesson_id uuid,
  lesson_title text,
  lesson_type text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own engagement" ON public.student_engagement;
DROP POLICY IF EXISTS "Users can insert own engagement" ON public.student_engagement;
DROP POLICY IF EXISTS "Users can update own engagement" ON public.student_engagement;
DROP POLICY IF EXISTS "Admins can view all engagement" ON public.student_engagement;

CREATE POLICY "Users can view own engagement"
ON public.student_engagement
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement"
ON public.student_engagement
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own engagement"
ON public.student_engagement
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all engagement"
ON public.student_engagement
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own activity events" ON public.student_activity_events;
DROP POLICY IF EXISTS "Users can insert own activity events" ON public.student_activity_events;
DROP POLICY IF EXISTS "Admins can view all activity events" ON public.student_activity_events;

CREATE POLICY "Users can view own activity events"
ON public.student_activity_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity events"
ON public.student_activity_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity events"
ON public.student_activity_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_student_engagement_last_seen ON public.student_engagement (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_engagement_online_until ON public.student_engagement (online_until DESC);
CREATE INDEX IF NOT EXISTS idx_student_activity_events_user_created ON public.student_activity_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_activity_events_created ON public.student_activity_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_activity_events_type ON public.student_activity_events (event_type);

CREATE TRIGGER update_student_engagement_updated_at
BEFORE UPDATE ON public.student_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_engagement;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity_events;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;