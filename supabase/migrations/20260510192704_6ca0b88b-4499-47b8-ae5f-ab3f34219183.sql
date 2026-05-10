
-- Tabela única (uma linha por section_key) com ordem global controlada pelo admin
CREATE TABLE IF NOT EXISTS public.home_section_order (
  section_key text PRIMARY KEY,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_section_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view home order"
  ON public.home_section_order FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage home order"
  ON public.home_section_order FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sementes: ordem padrão atual da home
INSERT INTO public.home_section_order (section_key, sort_order, visible) VALUES
  ('hero_cta', 10, true),
  ('gamification', 20, true),
  ('achievements', 30, true),
  ('quick_links', 40, true),
  ('progress_challenge', 50, true),
  ('modules', 60, true)
ON CONFLICT (section_key) DO NOTHING;

-- Permitir admins verem todas as anotações dos alunos
CREATE POLICY "Admins can view all lesson notes"
  ON public.lesson_notes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
