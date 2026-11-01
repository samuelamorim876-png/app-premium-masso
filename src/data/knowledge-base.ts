// Base de conhecimento local do Assistente do Curso.
// Funciona 100% no navegador: nenhuma IA, nenhuma chamada externa, nenhum custo.

export interface KnowledgeEntry {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "como-estudar",
    title: "Como estudar o curso",
    keywords: ["comecar", "começar", "estudar", "ordem", "inicio", "início", "por onde", "cronograma", "rotina"],
    answer:
      "**Sugestão de estudo:**\n\n- Siga os módulos na ordem em que aparecem na tela inicial.\n- Assista 1 a 3 aulas por dia e marque cada aula como concluída.\n- Use **Minhas Anotações** para registrar o que aprendeu.\n- Depois de cada bloco, pratique no **Simulador** e consulte os **Protocolos**.",
  },
  {
    id: "introducao",
    title: "Introdução à Massoterapia",
    keywords: ["massoterapia", "introducao", "introdução", "toque", "o que e", "o que é", "beneficios", "benefícios"],
    answer:
      "A **massoterapia** usa técnicas manuais de toque para promover relaxamento, alívio de tensões, melhora da circulação e bem-estar. Comece pelo módulo de **Introdução** para entender os fundamentos e o poder do toque.",
  },
  {
    id: "etica",
    title: "Ética e postura profissional",
    keywords: ["etica", "ética", "postura", "profissional", "cliente", "atendimento", "comportamento", "sigilo"],
    answer:
      "**Ética profissional:** respeite limites do cliente, mantenha sigilo, explique a técnica antes de começar, peça consentimento e mantenha o ambiente limpo e organizado. Veja o módulo de **Ética e Postura Profissional**.",
  },
  {
    id: "anatomia",
    title: "Anatomia e fisiologia",
    keywords: ["anatomia", "fisiologia", "musculo", "músculo", "musculos", "osso", "ossos", "esqueleto", "circulatorio", "circulatório", "pele", "tegumentar"],
    answer:
      "O módulo de **Anatomia e Fisiologia Básica** cobre os sistemas esquelético, muscular, circulatório e tegumentar. Conhecer essas estruturas ajuda a aplicar a pressão correta e evitar lesões.",
  },
  {
    id: "relaxante",
    title: "Massagem relaxante",
    keywords: ["relaxante", "relaxamento", "estresse", "ansiedade", "costas", "facial", "pernas", "bracos", "braços"],
    answer:
      "A **massagem relaxante** usa deslizamentos lentos (effleurage), amassamentos leves e ritmo constante. Trabalhe face, membros superiores, pernas e costas. Confira o módulo de **Massagem Relaxante**.",
  },
  {
    id: "drenagem",
    title: "Drenagem linfática",
    keywords: ["drenagem", "linfatica", "linfática", "inchaco", "inchaço", "retencao", "retenção", "liquido", "líquido", "linfa"],
    answer:
      "A **drenagem linfática** usa movimentos suaves, lentos e rítmicos, sempre no sentido dos linfonodos. Comece pela ativação e siga para pernas, braços, tórax, abdômen e costas. Veja o módulo de **Drenagem Linfática**.",
  },
  {
    id: "reflexologia",
    title: "Reflexologia podal",
    keywords: ["reflexologia", "podal", "pes", "pés", "pe", "pontos reflexos"],
    answer:
      "A **reflexologia podal** estimula pontos dos pés que correspondem a regiões do corpo. Estude o mapa reflexo no módulo de **Reflexologia Podal** antes de praticar.",
  },
  {
    id: "modeladora",
    title: "Massagem modeladora",
    keywords: ["modeladora", "celulite", "gordura", "contorno", "estetica", "estética", "abdomen", "abdômen"],
    answer:
      "A **massagem modeladora** usa movimentos vigorosos e rápidos para estimular a circulação e trabalhar o contorno corporal (pernas, abdômen, braços, costas). Veja o módulo de **Massagem Modeladora**.",
  },
  {
    id: "auriculo",
    title: "Auriculoterapia",
    keywords: ["auriculo", "auriculoterapia", "orelha", "sementes", "pontos auriculares"],
    answer:
      "A **auriculoterapia** estimula pontos da orelha (com sementes, cristais ou pressão). Consulte o módulo de **Auriculoterapia** para o mapa de pontos.",
  },
  {
    id: "moxa",
    title: "Moxabustão",
    keywords: ["moxa", "moxabustao", "moxabustão", "calor", "artemisia", "artemísia"],
    answer:
      "A **moxabustão** aplica calor com bastão de artemísia próximo a pontos específicos. Mantenha distância segura da pele. Veja o módulo de **Moxabustão**.",
  },
  {
    id: "especializadas",
    title: "Técnicas especializadas",
    keywords: ["neuromuscular", "craniofacial", "miofascial", "postural", "gestante", "gestantes", "gravida", "grávida", "ayurvedica", "ayurvédica", "aromaterapia", "oleos essenciais", "óleos essenciais"],
    answer:
      "As **técnicas especializadas** incluem Neuromuscular, Craniofacial, Miofascial, Correção Postural, Gestantes, Ayurvédica e Aromaterapia. Para **gestantes**, use posição lateral e evite pressão profunda no abdômen.",
  },
  {
    id: "avancadas",
    title: "Técnicas avançadas",
    keywords: ["lomi", "pindas", "tailandesa", "bambu", "bambuterapia", "conchas", "velas", "pedras", "quentes"],
    answer:
      "As **técnicas avançadas** incluem Lomi Lomi, Pindas Herbais, Massagem Tailandesa, Bambuterapia, Conchas e Velas Quentes. Sempre teste a temperatura dos materiais antes de aplicar.",
  },
  {
    id: "clinicas",
    title: "Terapias clínicas",
    keywords: ["fibromialgia", "espasmo", "espasmos", "enxaqueca", "dor de cabeca", "dor de cabeça", "fascite", "artrite", "pos-operatorio", "pós-operatório", "respiratorio", "respiratório", "dor"],
    answer:
      "O curso tem **terapias clínicas** para fibromialgia, espasmos, enxaquecas, fascite plantar, artrite, pós-operatório e problemas respiratórios. Use os **Protocolos de Atendimento** para o passo a passo de cada caso.",
  },
  {
    id: "lombar",
    title: "Dor lombar",
    keywords: ["lombar", "coluna", "lombalgia", "dor nas costas"],
    answer:
      "Para **dor lombar**, comece com aquecimento por deslizamentos, siga com amassamentos e liberação miofascial da região, e finalize com movimentos lentos. Veja o protocolo de lombar em **Protocolos**.",
  },
  {
    id: "contraindicacoes",
    title: "Indicações e contraindicações",
    keywords: ["contraindicacao", "contraindicação", "contraindicacoes", "contraindicações", "nao pode", "não pode", "febre", "trombose", "varizes", "ferida", "cancer", "câncer", "pressao", "pressão", "cuidado"],
    answer:
      "**Evite massagem** em casos de febre, infecções, trombose, feridas abertas, varizes severas e sem liberação médica em condições graves. Sempre faça uma anamnese. Veja o módulo de **Indicações e Contraindicações**.",
  },
  {
    id: "materiais",
    title: "Utensílios, materiais e produtos",
    keywords: ["material", "materiais", "oleo", "óleo", "creme", "maca", "toalha", "produto", "produtos", "utensilios", "utensílios"],
    answer:
      "Itens básicos: **maca**, lençóis e toalhas limpos, **óleos ou cremes** de massagem, almofadas de apoio e álcool para higienização. Veja o módulo de **Utensílios, Materiais e Produtos**.",
  },
  {
    id: "higiene",
    title: "Higiene do local",
    keywords: ["higiene", "limpeza", "limpar", "ambiente", "sala", "espaco", "espaço"],
    answer:
      "Higienize mãos e maca entre clientes, troque lençóis a cada atendimento e mantenha o ambiente ventilado. Veja o módulo de **Higiene do Local**.",
  },
  {
    id: "preco",
    title: "Precificação",
    keywords: ["preco", "preço", "cobrar", "valor", "precificacao", "precificação", "quanto cobrar", "clientes", "divulgar", "trabalhar"],
    answer:
      "Para **definir seu preço**, some custos (materiais, local, deslocamento), pesquise valores da sua região e considere a duração da sessão. Veja o módulo de **Precificação e Prática Profissional**.",
  },
  {
    id: "certificado",
    title: "Certificado",
    keywords: ["certificado", "certificacao", "certificação", "diploma", "conclusao", "conclusão"],
    answer:
      "Após **10 dias da compra**, aparece na tela inicial o botão para solicitar o **certificado**. Ele abre o módulo **Solicitação de Certificado** com as instruções.",
  },
  {
    id: "anotacoes",
    title: "Anotações",
    keywords: ["anotacao", "anotação", "anotacoes", "anotações", "caderno", "notas"],
    answer:
      "Você pode escrever anotações dentro de cada aula. Todas ficam reunidas em **Minhas Anotações**, acessível pela tela inicial.",
  },
  {
    id: "bloqueado",
    title: "Módulo bloqueado",
    keywords: ["bloqueado", "liberado", "liberacao", "liberação", "trancado", "cadeado", "nao abre", "não abre"],
    answer:
      "Alguns módulos são **liberados automaticamente após alguns dias** da sua compra. O cartão do módulo mostra quantos dias ou horas faltam para a liberação.",
  },
  {
    id: "simulador",
    title: "Simulador e protocolos",
    keywords: ["simulador", "praticar", "pratica", "prática", "protocolo", "protocolos", "caso", "casos"],
    answer:
      "Use o **Simulador de Atendimento** para treinar casos reais e os **Protocolos de Atendimento** para seguir planos passo a passo. Ambos estão na tela inicial.",
  },
  {
    id: "xp",
    title: "XP e conquistas",
    keywords: ["xp", "pontos", "nivel", "nível", "emblema", "emblemas", "conquista", "conquistas", "ranking"],
    answer:
      "Você ganha **XP** ao concluir aulas e módulos. Conforme avança, desbloqueia **emblemas e conquistas** exibidos na tela inicial e no seu perfil.",
  },
  {
    id: "video",
    title: "Problemas com vídeo ou PDF",
    keywords: ["video", "vídeo", "nao carrega", "não carrega", "travando", "pdf", "baixar", "download", "abrir"],
    answer:
      "Se um **vídeo ou PDF** não carregar: verifique sua internet, atualize a página e, no celular, tente abrir pelo navegador Chrome ou Safari. Se persistir, fale com o suporte.",
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set(["a", "o", "e", "de", "da", "do", "das", "dos", "em", "um", "uma", "para", "com", "como", "que", "qual", "quais", "na", "no", "por", "se", "eu", "me", "meu", "minha", "sobre", "faz", "fazer"]);

/** Pesquisa textual simples na base local. Retorna as melhores entradas (ou vazio). */
export function searchKnowledge(question: string, context?: string, limit = 2): KnowledgeEntry[] {
  const q = normalize(`${question} ${context ?? ""}`);
  const words = q.split(" ").filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (!q) return [];

  const scored = KNOWLEDGE_BASE.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      const k = normalize(kw);
      if (k.includes(" ")) {
        if (q.includes(k)) score += 3;
      } else if (words.some((w) => w === k)) {
        score += 3;
      } else if (words.some((w) => w.length > 3 && (k.startsWith(w) || w.startsWith(k)))) {
        score += 1;
      }
    }
    const t = normalize(entry.title);
    if (words.some((w) => t.includes(w))) score += 1;
    return { entry, score };
  })
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}

export function buildLocalAnswer(question: string, context?: { moduleName: string; lessonName: string }): string {
  // Primeiro tenta só com a pergunta; se nada for encontrado, usa o contexto da aula.
  let results = searchKnowledge(question);
  if (results.length === 0 && context) results = searchKnowledge(question, `${context.moduleName} ${context.lessonName}`);

  if (results.length === 0) {
    return (
      "Não encontrei uma resposta pronta para essa pergunta. 🤔\n\n" +
      "Tente usar palavras-chave como **drenagem**, **relaxante**, **contraindicações**, **materiais**, **preço** ou **certificado**. " +
      "Você também pode revisar as aulas do módulo ou falar com o suporte."
    );
  }

  return results.map((r) => `### ${r.title}\n\n${r.answer}`).join("\n\n---\n\n");
}
