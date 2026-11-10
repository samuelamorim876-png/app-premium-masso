import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SectionKey =
  | "hero_cta"
  | "gamification"
  | "achievements"
  | "quick_links"
  | "progress_challenge"
  | "modules";

export interface HomeSection {
  section_key: SectionKey;
  sort_order: number;
  visible: boolean;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero_cta: 'Banner "Começar a Estudar"',
  gamification: "Barra de Gamificação (XP/Nível)",
  achievements: "Conquistas",
  quick_links: "Atalhos (Assistente, Simulador, etc.)",
  progress_challenge: "Progresso + Desafio Diário",
  modules: "Lista de Módulos",
};

const DEFAULTS: HomeSection[] = [
  { section_key: "hero_cta", sort_order: 10, visible: true },
  { section_key: "gamification", sort_order: 20, visible: true },
  { section_key: "achievements", sort_order: 30, visible: true },
  { section_key: "quick_links", sort_order: 40, visible: true },
  { section_key: "progress_challenge", sort_order: 50, visible: true },
  { section_key: "modules", sort_order: 60, visible: true },
];

export function useHomeSections() {
  const [sections, setSections] = useState<HomeSection[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("home_section_order")
      .select("section_key, sort_order, visible")
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) {
      setSections(data as HomeSection[]);
    }
    setLoading(false);
  }, []);

  // Carrega uma vez ao abrir a tela; sem canal em tempo real permanente.
  useEffect(() => {
    load();
  }, [load]);

  return { sections, loading, reload: load };
}

export async function persistSectionOrder(items: HomeSection[]) {
  const rows = items.map((s, i) => ({
    section_key: s.section_key,
    sort_order: (i + 1) * 10,
    visible: s.visible,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from("home_section_order")
    .upsert(rows, { onConflict: "section_key" });
  if (error) throw error;
}
