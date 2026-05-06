
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Managed courses table (Nossos Cursos section)
CREATE TABLE public.managed_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  badge TEXT,
  purchase_link TEXT,
  available BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.managed_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" ON public.managed_courses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage courses" ON public.managed_courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Managed modules table
CREATE TABLE public.managed_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  days_to_unlock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.managed_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON public.managed_modules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage modules" ON public.managed_modules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Managed lessons table
CREATE TABLE public.managed_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.managed_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video',
  content_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.managed_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" ON public.managed_lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage lessons" ON public.managed_lessons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Timestamps triggers
CREATE TRIGGER update_managed_courses_updated_at
  BEFORE UPDATE ON public.managed_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_managed_modules_updated_at
  BEFORE UPDATE ON public.managed_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_managed_lessons_updated_at
  BEFORE UPDATE ON public.managed_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add INSERT policy for profiles (needed for auto-creation trigger)
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add premium_access field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_access BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
