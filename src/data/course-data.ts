export interface Lesson {
  id: string;
  title: string;
}

export interface Module {
  id: string;
  title: string;
  emoji: string;
  lessons: Lesson[];
}

export const courseModules: Module[] = [
  {
    id: "mod-1",
    title: "Fundamentos da Massoterapia",
    emoji: "🔹",
    lessons: [
      { id: "1-1", title: "Introdução à Massoterapia" },
      { id: "1-2", title: "Utensílios, Materiais e Produtos" },
      { id: "1-3", title: "Higiene e Organização do Local" },
      { id: "1-4", title: "Biossegurança" },
    ],
  },
  {
    id: "mod-2",
    title: "Anatomia Básica",
    emoji: "🔹",
    lessons: [
      { id: "2-1", title: "Sistema Esquelético" },
      { id: "2-2", title: "Sistema Muscular" },
      { id: "2-3", title: "Sistema Circulatório" },
      { id: "2-4", title: "Sistema Tegumentar (Pele)" },
    ],
  },
  {
    id: "mod-3",
    title: "Ética Profissional",
    emoji: "🔹",
    lessons: [
      { id: "3-1", title: "Código de Ética e Conduta do Terapeuta" },
      { id: "3-2", title: "Importância da Confidencialidade" },
      { id: "3-3", title: "Limites Profissionais e Relacionamento com Clientes" },
      { id: "3-4", title: "Consentimento Informado em Massoterapia" },
      { id: "3-5", title: "Construindo uma Prática Sustentável" },
    ],
  },
  {
    id: "mod-4",
    title: "Início da Prática (Massagem Relaxante)",
    emoji: "🔹",
    lessons: [
      { id: "4-1", title: "Introdução à Massagem Relaxante" },
      { id: "4-2", title: "Massagem Facial" },
      { id: "4-3", title: "Membros Superiores" },
      { id: "4-4", title: "Pernas" },
      { id: "4-5", title: "Pés" },
      { id: "4-6", title: "Costas" },
    ],
  },
  {
    id: "mod-5",
    title: "Drenagem Linfática",
    emoji: "🔹",
    lessons: [
      { id: "5-1", title: "Introdução" },
      { id: "5-2", title: "Ativação da Linfa" },
      { id: "5-3", title: "Pernas (Frente)" },
      { id: "5-4", title: "Braço e Tórax" },
      { id: "5-5", title: "Pernas (Posterior)" },
      { id: "5-6", title: "Abdômen e Fechamento" },
      { id: "5-7", title: "Costas" },
    ],
  },
  {
    id: "mod-6",
    title: "Massagem Modeladora",
    emoji: "🔹",
    lessons: [
      { id: "6-1", title: "Introdução" },
      { id: "6-2", title: "Esfoliação" },
      { id: "6-3", title: "Pernas (Frente)" },
      { id: "6-4", title: "Abdômen" },
      { id: "6-5", title: "Braços" },
      { id: "6-6", title: "Pernas (Posterior e Glúteos)" },
      { id: "6-7", title: "Costas" },
    ],
  },
  {
    id: "mod-7",
    title: "Reflexologia Podal",
    emoji: "🔹",
    lessons: [
      { id: "7-1", title: "Introdução" },
      { id: "7-2", title: "Prática" },
    ],
  },
  {
    id: "mod-8",
    title: "Auriculoterapia",
    emoji: "🔹",
    lessons: [
      { id: "8-1", title: "Introdução" },
      { id: "8-2", title: "Prática" },
    ],
  },
  {
    id: "mod-9",
    title: "Moxabustão",
    emoji: "🔹",
    lessons: [
      { id: "9-1", title: "Introdução" },
      { id: "9-2", title: "Prática" },
    ],
  },
  {
    id: "mod-10",
    title: "Técnicas Especializadas",
    emoji: "🔹",
    lessons: [
      { id: "10-1", title: "Massagem Reflexológica" },
      { id: "10-2", title: "Massagem Neuromuscular" },
      { id: "10-3", title: "Craniofacial" },
      { id: "10-4", title: "Miofascial" },
      { id: "10-5", title: "Correção Postural" },
      { id: "10-6", title: "Gestantes" },
      { id: "10-7", title: "Ayurvédica" },
      { id: "10-8", title: "Aromaterapia" },
    ],
  },
  {
    id: "mod-11",
    title: "Aplicações Profissionais",
    emoji: "🔹",
    lessons: [
      { id: "11-1", title: "Massagem Energética" },
      { id: "11-2", title: "Massagem para Idosos" },
      { id: "11-3", title: "Velas Quentes" },
      { id: "11-4", title: "Desintoxicante" },
      { id: "11-5", title: "Bambus" },
      { id: "11-6", title: "Corporativo" },
      { id: "11-7", title: "Enxaquecas" },
      { id: "11-8", title: "Cicatrização" },
      { id: "11-9", title: "Recuperação Muscular" },
      { id: "11-10", title: "Pacientes Oncológicos" },
      { id: "11-11", title: "Técnicas de Respiração" },
    ],
  },
  {
    id: "mod-12",
    title: "Técnicas Avançadas",
    emoji: "🔹",
    lessons: [
      { id: "12-1", title: "Bioenergética" },
      { id: "12-2", title: "Atletas de Alta Performance" },
      { id: "12-3", title: "Reabilitação Ortopédica" },
      { id: "12-4", title: "Óleos Essenciais" },
      { id: "12-5", title: "Lomi Lomi" },
      { id: "12-6", title: "Pindas Herbais" },
      { id: "12-7", title: "Antiestresse" },
      { id: "12-8", title: "Celulite" },
      { id: "12-9", title: "Conchas" },
      { id: "12-10", title: "Tailandesa" },
    ],
  },
  {
    id: "mod-13",
    title: "Terapias Clínicas",
    emoji: "🔹",
    lessons: [
      { id: "13-1", title: "Fibromialgia" },
      { id: "13-2", title: "Espasmos Musculares" },
      { id: "13-3", title: "Ervas Aromáticas" },
      { id: "13-4", title: "Tensão no Pescoço e Ombros" },
      { id: "13-5", title: "Alongamento Passivo" },
      { id: "13-6", title: "Flexibilidade" },
      { id: "13-7", title: "Lesões Desportivas" },
      { id: "13-8", title: "Fascite Plantar" },
      { id: "13-9", title: "Artrite" },
      { id: "13-10", title: "Técnicas de Percussão" },
      { id: "13-11", title: "Pós-operatório" },
      { id: "13-12", title: "Problemas Respiratórios" },
      { id: "13-13", title: "Sistema Imunológico" },
    ],
  },
  {
    id: "mod-14",
    title: "Especializações e Bônus",
    emoji: "🎁",
    lessons: [
      { id: "14-1", title: "Bambuterapia" },
      { id: "14-2", title: "Pantalas" },
      { id: "14-3", title: "Ventosaterapia Aplicada" },
      { id: "14-4", title: "Modeladora Turbinada" },
      { id: "14-5", title: "Outras Técnicas" },
      { id: "14-6", title: "Precificação" },
      { id: "14-7", title: "Apostila Completa (PDF)" },
    ],
  },
];

export const totalLessons = courseModules.reduce((acc, mod) => acc + mod.lessons.length, 0);
