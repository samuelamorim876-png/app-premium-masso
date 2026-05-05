export type LessonType = "video" | "pdf" | "info";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  /** URL for video or PDF — set later by the course admin */
  url?: string;
}

export type UnlockRule =
  | { kind: "immediate" }
  | { kind: "days_after_purchase"; days: number }
  | { kind: "after_previous" };

export interface Module {
  id: string;
  title: string;
  emoji: string;
  lessons: Lesson[];
  unlock: UnlockRule;
}

export const courseModules: Module[] = [
  // ─── MI-A ───
  {
    id: "mi-a",
    title: "Módulo Inicial – Apresentação",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      { id: "mia-1", title: "Importante – Leia Antes de Começar", type: "pdf" },
      { id: "mia-2", title: "Avisos", type: "video", url: "..." },
    ],
  },
  // ─── Matérias Complementares 1 ───
  {
    id: "mc-1",
    title: "Matérias Complementares 1",
    emoji: "📄",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "mc1-1",
        title: "Introdução à Massoterapia e o Poder do Toque",
        type: "pdf",
        url: "https://drive.google.com/file/d/1nRhVxNoOMMLma6icsyxV36HP-jrHsZ9i/view?usp=drive_link",
      },
      {
        id: "mc1-2",
        title: "Ética e Postura Profissional do Massoterapeuta",
        type: "pdf",
        url: "https://drive.google.com/file/d/1-prMas1etja4UB0otz6QH70dA6LVEgf8/view?usp=drive_link",
      },
      {
        id: "mc1-3",
        title: "Anatomia e Fisiologia Básica para Massoterapeutas",
        type: "pdf",
        url: "https://drive.google.com/file/d/1T1ODNlFep32H74JCQ3_Xw26lGLxSoJtN/view?usp=drive_link",
      },
      {
        id: "mc1-4",
        title: "História e Evolução da Massoterapia no Mundo",
        type: "pdf",
        url: "https://drive.google.com/file/d/1g478dFtnJ_hVmd1Sk478IgiiVqItpcSk/view?usp=drive_link",
      },
    ],
  },
  // ─── Matérias Complementares 2 ───
  {
    id: "mc-2",
    title: "Matérias Complementares 2",
    emoji: "📄",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "mc2-1",
        title: "Princípios e Efeitos da Massagem Relaxante",
        type: "pdf",
        url: "https://drive.google.com/file/d/11-3d-2u0KO0uHWbHKVzXaFJq5hg0jYsV/view?usp=drive_link",
      },
      {
        id: "mc2-2",
        title: "Manobras Básicas da Massagem Relaxante: Deslizes, Amassamentos e Fricções",
        type: "pdf",
        url: "https://drive.google.com/file/d/16N3Q2ypu1ASqt833zgpfvrxTHQEEvSnZ/view?usp=drive_link",
      },
      {
        id: "mc2-3",
        title: "Sequência Completa de Massagem Relaxante Corporal",
        type: "pdf",
        url: "https://drive.google.com/file/d/1nD6DKlJkiF3s1Sfs1iFwfiB7vQ7MgAZv/view?usp=drive_link",
      },
      {
        id: "mc2-4",
        title: "Indicações, Contraindicações e Cuidados Essenciais",
        type: "pdf",
        url: "https://drive.google.com/file/d/1pVg46FFuoFVhzWB_I6RZMt98oiNQfKG_/view?usp=drive_link",
      },
    ],
  },
  // ─── Matérias Complementares 3 ───
  {
    id: "mc-3",
    title: "Matérias Complementares 3",
    emoji: "📄",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "mc3-1",
        title: "Avaliação e Anamnese: Entendendo as Queixas do Cliente",
        type: "pdf",
        url: "https://drive.google.com/file/d/1ZZKAgIkTwFv_Nl5LV7raWHFqW5djYq5t/view?usp=drive_link",
      },
      {
        id: "mc3-2",
        title: "Massagem para Dores Musculares e Tensão Crônica",
        type: "pdf",
        url: "https://drive.google.com/file/d/1n8HX0fkMVtHnEbNOd16pgySiE-0N0B7k/view?usp=drive_link",
      },
      {
        id: "mc3-3",
        title: "Abordagem Massoterapêutica para Lesões e Inflamações Comuns",
        type: "pdf",
        url: "https://drive.google.com/file/d/1WhFw5omUHw9a63Zg39weQqYkLxRMhiuI/view?usp=drive_link",
      },
      {
        id: "mc3-4",
        title: "Técnicas Complementares: Alongamentos e Mobilizações Articulares",
        type: "pdf",
        url: "https://drive.google.com/file/d/1Znn7_oYuL_G-CtoJ81Pu_YeJdgLORLe-/view?usp=drive_link",
      },
    ],
  },
  // ─── Matérias Complementares 4 ───
  {
    id: "mc-4",
    title: "Matérias Complementares 4",
    emoji: "📄",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "mc4-1",
        title: "Introdução à Massagem Desportiva: Preparação e Recuperação",
        type: "pdf",
        url: "https://drive.google.com/file/d/1vEwm2NPmTXkhsfB7e3rN6_36usNMgtLF/view?usp=drive_link",
      },
      {
        id: "mc4-2",
        title: "Massagem Modeladora e Drenagem Linfática: Conceitos e Aplicações",
        type: "pdf",
        url: "https://drive.google.com/file/d/1QGwijvqguVfBb7qhtALjILKnfnQtGc17/view?usp=drive_link",
      },
      {
        id: "mc4-3",
        title: "Reflexologia Podal: Pontos e Benefícios Terapêuticos",
        type: "pdf",
        url: "https://drive.google.com/file/d/10CNprdu179BcX0NKufx8QP549O41YnKD/view?usp=drive_link",
      },
      {
        id: "mc4-4",
        title: "Massagem em Gestantes e Idosos: Adaptações e Cuidados Especiais",
        type: "pdf",
        url: "https://drive.google.com/file/d/14jX7iiNiwEQyUxim7fIKZ3Vono2Sj2Dg/view?usp=drive_link",
      },
      {
        id: "mc4-5",
        title: "Biossegurança na Massoterapia: Higiene e Prevenção de Contaminações",
        type: "pdf",
        url: "https://drive.google.com/file/d/1BDclgJPq84cMSkz9scljziPSq6Pm9eux/view?usp=drive_link",
      },
    ],
  },
  // ─── Módulo 5 ───
  {
    id: "mod-5",
    title: "Módulo 5 – Início do Curso",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "5-1",
        title: "Utensílios, Materiais e Produtos",
        type: "video",
        url: "https://www.youtube.com/embed/2DeoiByPSM8",
      },
      { id: "5-2", title: "Higiene do Local", type: "video", url: "https://www.youtube.com/embed/Fs6rMWGesR4" },
    ],
  },
  // ─── Módulo 6 ───
  {
    id: "mod-6",
    title: "Módulo 6 – Anatomia Aplicada",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "6-1",
        title: "Sistema Esquelético",
        type: "video",
        url: "https://www.youtube-nocookie.com/embed/BdOZuePswlo",
      },
      { id: "6-2", title: "Sistema Muscular", type: "video", url: "https://www.youtube.com/embed/PU8mvYEHSXU" },
      { id: "6-3", title: "Sistema Circulatório", type: "video", url: "https://www.youtube.com/embed/GDbEdkGSy6U" },
      {
        id: "6-4",
        title: "Sistema Tegumentar (pele)",
        type: "video",
        url: "https://www.youtube.com/embed/GZciUXZ88U8",
      },
    ],
  },
  // ─── Módulo 7 ───
  {
    id: "mod-7",
    title: "Módulo 7 – Ética Profissional",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "7-1",
        title: "Código de Ética e Conduta do Terapeuta",
        type: "video",
        url: "https://www.youtube.com/embed/nAu13KcOq2k",
      },
      {
        id: "7-2",
        title: "Importância da Confidencialidade",
        type: "video",
        url: "https://www.youtube.com/embed/AC5nXB8IxWY",
      },
      {
        id: "7-3",
        title: "Limites Profissionais e Relacionamento com Clientes",
        type: "video",
        url: "https://www.youtube.com/embed/nGkaDOp8bew",
      },
      {
        id: "7-4",
        title: "Construindo uma Prática Profissional Sustentável",
        type: "video",
        url: "https://www.youtube.com/embed/1kct5IaaYM0",
      },
    ],
  },
  // ─── Módulo 8 ───
  {
    id: "mod-8",
    title: "Módulo 8 – Massagem Relaxante",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "8-1",
        title: "Introdução à Massagem Relaxante",
        type: "video",
        url: "https://www.youtube.com/embed/uxzt2M6oxkU",
      },
      {
        id: "8-2",
        title: "Massagem Relaxante Facial",
        type: "video",
        url: "https://www.youtube.com/embed/GJY4UrxiET0",
      },
      {
        id: "8-3",
        title: "Massagem Relaxante Membros Superiores",
        type: "video",
        url: "https://www.youtube.com/embed/EVE_s14HyNM",
      },
      {
        id: "8-4",
        title: "Massagem Relaxante nas Pernas",
        type: "video",
        url: "https://www.youtube.com/embed/kWDJTqMZomY",
      },
      {
        id: "8-5",
        title: "Massagem Relaxante Costas",
        type: "video",
        url: "https://www.youtube.com/embed/T_rcWdPJnSc",
      },
    ],
  },
  // ─── Módulo 9 ───
  {
    id: "mod-9",
    title: "Módulo 9 – Drenagem Linfática",
    emoji: "🔹",
    unlock: { kind: "immediate" },
    lessons: [
      {
        id: "9-1",
        title: "Introdução à Drenagem Linfática",
        type: "video",
        url: "https://www.youtube.com/embed/vQDuO03CQfM",
      },
      { id: "9-2", title: "Ativação da Linfa", type: "video", url: "https://www.youtube.com/embed/jcTceP1_q2E" },
      { id: "9-3", title: "Drenagem Pernas", type: "video", url: "https://www.youtube.com/embed/sD-vDlvtekM" },
      { id: "9-4", title: "Drenagem Braços e Tórax", type: "video", url: "https://www.youtube.com/embed/cXDeBtpWCFc" },
      {
        id: "9-5",
        title: "Drenagem Pernas Superiores",
        type: "video",
        url: "https://www.youtube.com/embed/9hsEzYWoldo",
      },
      {
        id: "9-6",
        title: "Drenagem Abdômen e Fechamento",
        type: "video",
        url: "https://www.youtube.com/embed/ZyVbN7Tqbgg",
      },
      {
        id: "9-7",
        title: "Drenagem Linfática Costas",
        type: "video",
        url: "https://www.youtube.com/embed/MuOHOz2qhok",
      },
    ],
  },
  // ─── Módulo 10 ───
  {
    id: "mod-10",
    title: "Módulo 10 – Estudos Práticos (Reflexologia)",
    emoji: "🔹",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      {
        id: "10-1",
        title: "Início Reflexologia Podal",
        type: "video",
        url: "https://www.youtube.com/watch?v=HRoE5K8hGmo",
      },
      { id: "10-2", title: "Reflexologia Podal 2", type: "video", url: "https://www.youtube.com/embed/Z4Nuzd3b67U" },
    ],
  },
  // ─── Módulo 12 ───
  {
    id: "mod-12",
    title: "Módulo 12 – Estudo Prático (Modeladora)",
    emoji: "🔹",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "12-1", title: "Massagem Modeladora Pernas", type: "video", url: "..." },
      { id: "12-2", title: "Massagem Modeladora Abdômen", type: "video", url: "..." },
      { id: "12-3", title: "Massagem Modeladora Braços", type: "video", url: "..." },
      { id: "12-4", title: "Massagem Modeladora Pernas 2", type: "video", url: "..." },
      { id: "12-5", title: "Massagem Modeladora Costas", type: "video", url: "..." },
    ],
  },
  // ─── Módulo 13 ───
  {
    id: "mod-13",
    title: "Módulo 13 – Estudos Práticos (Auriculoterapia)",
    emoji: "🔹",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "13-1", title: "Introdução Auriculoterapia", type: "video", url: "..." },
      { id: "13-2", title: "Auriculoterapia 2", type: "video", url: "..." },
    ],
  },
  // ─── Módulo 14 ───
  {
    id: "mod-14",
    title: "Módulo 14 – Estudo Prático (Moxabustão)",
    emoji: "🔹",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "14-1", title: "Introdução ao Moxabustão", type: "video", url: "..." },
      { id: "14-2", title: "Moxabustão Prática", type: "video", url: "..." },
    ],
  },
  // ─── Módulo 15 ───
  {
    id: "mod-15",
    title: "Módulo 15 – Estudos Práticos (Técnicas Especializadas)",
    emoji: "📄",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "15-1", title: "Técnicas de Massagem Reflexológica", type: "pdf" },
      { id: "15-2", title: "Massagem Neuromuscular", type: "pdf" },
      { id: "15-3", title: "Massagem Craniofacial", type: "pdf" },
      { id: "15-4", title: "Massagem Miofascial", type: "pdf" },
      { id: "15-5", title: "Massagem para Correção Postural", type: "pdf" },
      { id: "15-6", title: "Massagem para Gestantes", type: "pdf" },
      { id: "15-7", title: "Massagem Ayurvédica", type: "pdf" },
      { id: "15-8", title: "Aromaterapia na Massoterapia", type: "pdf" },
    ],
  },
  // ─── Módulo 16 ───
  {
    id: "mod-16",
    title: "Módulo 16 – Estudos Práticos (Aplicações Profissionais)",
    emoji: "📄",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "16-1", title: "Massagem Energética", type: "pdf" },
      { id: "16-2", title: "Massagem para Idosos", type: "pdf" },
      { id: "16-3", title: "Massagem com Velas Quentes", type: "pdf" },
      { id: "16-4", title: "Massagem Desintoxicante", type: "pdf" },
      { id: "16-5", title: "Massagem com Bambus", type: "pdf" },
      { id: "16-6", title: "Massagem em Ambientes Corporativos", type: "pdf" },
      { id: "16-7", title: "Técnicas de Massagem para Alívio de Enxaquecas", type: "pdf" },
      { id: "16-8", title: "Massagem para Cicatrização de Tecidos", type: "pdf" },
      { id: "16-9", title: "Massagem para Recuperação Muscular", type: "pdf" },
      { id: "16-10", title: "Massagem em Pacientes Oncológicos", type: "pdf" },
      { id: "16-11", title: "Técnicas de Respiração Aplicadas à Massoterapia", type: "pdf" },
    ],
  },
  // ─── Módulo 17 ───
  {
    id: "mod-17",
    title: "Módulo 17 – Estudos Práticos (Técnicas Avançadas)",
    emoji: "📄",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "17-1", title: "Massagem Bioenergética", type: "pdf" },
      { id: "17-2", title: "Massagem para Atletas de Alta Performance", type: "pdf" },
      { id: "17-3", title: "Massagem para Reabilitação Ortopédica", type: "pdf" },
      { id: "17-4", title: "Massagem Terapêutica com Óleos Essenciais", type: "pdf" },
      { id: "17-5", title: "Massagem Lomi Lomi", type: "pdf" },
      { id: "17-6", title: "Massagem com Pindas Herbais", type: "pdf" },
      { id: "17-7", title: "Massagem para Tratamento de Celulite", type: "pdf" },
      { id: "17-8", title: "Massagem com Conchas", type: "pdf" },
      { id: "17-9", title: "Massagem Tailandesa", type: "pdf" },
    ],
  },
  // ─── Módulo 18 ───
  {
    id: "mod-18",
    title: "Módulo 18 – Estudos Práticos (Terapias Clínicas)",
    emoji: "📄",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "18-1", title: "Massagem Terapêutica em Pacientes com Fibromialgia", type: "pdf" },
      { id: "18-2", title: "Massagem Terapêutica para Redução de Espasmos Musculares", type: "pdf" },
      { id: "18-3", title: "Massagem com Ervas Aromáticas", type: "pdf" },
      { id: "18-4", title: "Massagem Terapêutica para Alívio de Tensão no Pescoço e Ombros", type: "pdf" },
      { id: "18-5", title: "Massagem Terapêutica com Alongamento Passivo", type: "pdf" },
      { id: "18-6", title: "Massagem para Melhoria da Flexibilidade", type: "pdf" },
      { id: "18-7", title: "Massagem Terapêutica em Pacientes com Lesões Desportivas", type: "pdf" },
      { id: "18-8", title: "Massagem Terapêutica para Tratamento de Fascite Plantar", type: "pdf" },
      { id: "18-9", title: "Massagem Terapêutica em Pacientes com Artrite", type: "pdf" },
      { id: "18-10", title: "Massagem Terapêutica com Técnicas de Percussão", type: "pdf" },
      { id: "18-11", title: "Massagem para Redução de Dor em Pacientes Pós-operatórios", type: "pdf" },
      { id: "18-12", title: "Massagem Terapêutica para Problemas Respiratórios", type: "pdf" },
      { id: "18-13", title: "Massagem Terapêutica para Estímulo do Sistema Imunológico", type: "pdf" },
    ],
  },
  // ─── Módulo 19 ───
  {
    id: "mod-19",
    title: "Módulo 19 – Estudos Práticos (Bônus)",
    emoji: "🎁",
    unlock: { kind: "days_after_purchase", days: 7 },
    lessons: [
      { id: "19-1", title: "Massagem Modeladora Bambuterapia", type: "pdf" },
      { id: "19-2", title: "Massagem Modeladora Pantalas", type: "pdf" },
      { id: "19-3", title: "Massagem Modeladora Ventosa Aplicada", type: "pdf" },
      { id: "19-4", title: "Massagem Modeladora Turbinada", type: "pdf" },
      { id: "19-5", title: "Outras Técnicas", type: "pdf" },
      { id: "19-6", title: "Precificação", type: "pdf" },
    ],
  },
];

export const totalLessons = courseModules.reduce((acc, mod) => acc + mod.lessons.length, 0);
