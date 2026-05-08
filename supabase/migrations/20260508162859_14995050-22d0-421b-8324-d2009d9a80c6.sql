CREATE OR REPLACE FUNCTION public.increment_student_usage(_user_id uuid, _seconds integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  UPDATE public.student_engagement
  SET
    total_usage_seconds = total_usage_seconds + GREATEST(0, LEAST(COALESCE(_seconds, 0), 120)),
    last_seen_at = now(),
    online_until = now() + interval '90 seconds',
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_student_usage(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_student_usage(uuid, integer) TO authenticated;