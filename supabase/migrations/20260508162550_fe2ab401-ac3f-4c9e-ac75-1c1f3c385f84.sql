DROP POLICY IF EXISTS "Admins can view all lesson progress" ON public.lesson_progress;

CREATE POLICY "Admins can view all lesson progress"
ON public.lesson_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));