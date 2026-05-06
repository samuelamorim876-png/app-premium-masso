export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  patientComplaint: string;
  options: {
    label: string;
    correct: boolean;
    explanation: string;
  }[];
}

export const simulatorScenarios: SimulatorScenario[] = [
  {
    id: "sim-1",
    title: "Dor Lombar Crônica",
    description: "Paciente de 45 anos, trabalha sentado por 8 horas diárias. Queixa-se de dor lombar persistente há 3 meses.",
    patientComplaint: "Sinto uma dor constante na parte baixa das costas, que piora no final do dia.",
    options: [
      { label: "Massagem Relaxante nas Costas", correct: true, explanation: "Correto! A massagem relaxante nas costas alivia a tensão muscular acumulada e melhora a circulação local, ideal para dores posturais." },
      { label: "Drenagem Linfática", correct: false, explanation: "A drenagem linfática não é a melhor opção aqui. Ela é indicada para retenção de líquidos, não para dor muscular." },
      { label: "Reflexologia Podal", correct: false, explanation: "Embora a reflexologia tenha benefícios gerais, a abordagem direta na região lombar seria mais eficaz para esta queixa." },
      { label: "Massagem Modeladora", correct: false, explanation: "A modeladora é voltada para remodelação corporal, não para alívio de dor muscular crônica." },
    ],
  },
  {
    id: "sim-2",
    title: "Estresse e Ansiedade",
    description: "Paciente de 32 anos, executiva, relata insônia e tensão nos ombros e pescoço. Apresenta sinais de estresse elevado.",
    patientComplaint: "Não consigo dormir direito e sinto muita tensão no pescoço. Preciso relaxar.",
    options: [
      { label: "Massagem Relaxante Completa", correct: true, explanation: "Correto! A massagem relaxante reduz cortisol e promove liberação de endorfinas, ideal para estresse e insônia." },
      { label: "Massagem Desportiva", correct: false, explanation: "A desportiva é mais intensa e voltada para atletas. Pode aumentar o estresse se aplicada em quem busca relaxamento." },
      { label: "Moxabustão", correct: false, explanation: "Embora a moxabustão tenha benefícios, a massagem relaxante é mais indicada como primeira abordagem para estresse." },
      { label: "Massagem Modeladora no Abdômen", correct: false, explanation: "Não tem relação com a queixa. A modeladora trabalha a remodelação corporal, não o relaxamento." },
    ],
  },
  {
    id: "sim-3",
    title: "Pernas Cansadas e Inchaço",
    description: "Paciente de 55 anos, passa muito tempo em pé. Queixa-se de pernas pesadas e inchaço nos tornozelos ao final do dia.",
    patientComplaint: "Minhas pernas ficam muito pesadas e inchadas, especialmente à noite.",
    options: [
      { label: "Drenagem Linfática nas Pernas", correct: true, explanation: "Correto! A drenagem linfática é a técnica ideal para edema e pernas cansadas, pois estimula o retorno linfático e reduz o inchaço." },
      { label: "Massagem Modeladora nas Pernas", correct: false, explanation: "A modeladora é mais vigorosa e pode não ser indicada quando há edema significativo." },
      { label: "Reflexologia Podal", correct: false, explanation: "A reflexologia pode ajudar de forma complementar, mas a drenagem é a abordagem principal para inchaço." },
      { label: "Massagem Relaxante Facial", correct: false, explanation: "Não tem relação com a queixa nas pernas." },
    ],
  },
  {
    id: "sim-4",
    title: "Dor de Cabeça Tensional",
    description: "Paciente de 28 anos, estudante universitário. Relata dores de cabeça frequentes associadas a tensão muscular na nuca.",
    patientComplaint: "Tenho dores de cabeça quase todos os dias, e sinto a nuca muito dura.",
    options: [
      { label: "Massagem Relaxante Cervical e Craniana", correct: true, explanation: "Correto! A massagem na região cervical e craniana alivia a tensão que causa as dores de cabeça tensionais." },
      { label: "Drenagem Linfática Facial", correct: false, explanation: "A drenagem facial ajuda no edema, mas não é a melhor abordagem para tensão muscular cervical." },
      { label: "Massagem Modeladora nos Braços", correct: false, explanation: "Sem relação com a queixa. A modeladora nos braços trabalha remodelação, não alívio de cefaleia." },
      { label: "Auriculoterapia isolada", correct: false, explanation: "A auriculoterapia pode ser complementar, mas a massagem direta na região é mais eficaz como tratamento principal." },
    ],
  },
  {
    id: "sim-5",
    title: "Recuperação Pós-Exercício",
    description: "Paciente de 35 anos, praticante de musculação. Procura atendimento após treino intenso com dores musculares generalizadas.",
    patientComplaint: "Treinei pesado ontem e estou com muita dor muscular no corpo todo.",
    options: [
      { label: "Massagem Desportiva de Recuperação", correct: true, explanation: "Correto! A massagem desportiva pós-exercício ajuda na recuperação muscular, reduz dor tardia (DOMS) e melhora a circulação." },
      { label: "Massagem Relaxante Suave", correct: false, explanation: "Embora ajude, a massagem desportiva com técnicas específicas é mais eficaz para recuperação muscular." },
      { label: "Drenagem Linfática", correct: false, explanation: "A drenagem não é a abordagem ideal para dor muscular pós-exercício." },
      { label: "Moxabustão", correct: false, explanation: "A moxabustão não é a técnica mais indicada para recuperação muscular pós-treino." },
    ],
  },
  {
    id: "sim-6",
    title: "Gestante com Dor nas Costas",
    description: "Paciente grávida de 7 meses, queixa-se de dor nas costas e inchaço nos pés. Primeira gestação.",
    patientComplaint: "Estou com muita dor nas costas por causa do peso da barriga, e meus pés estão inchados.",
    options: [
      { label: "Massagem para Gestantes (adaptada)", correct: true, explanation: "Correto! A massagem adaptada para gestantes utiliza posicionamento lateral, pressão suave e técnicas seguras para o período gestacional." },
      { label: "Massagem Relaxante Convencional", correct: false, explanation: "A massagem convencional pode incluir técnicas e posições contraindicadas na gravidez. É necessário usar protocolos específicos." },
      { label: "Massagem Modeladora", correct: false, explanation: "Totalmente contraindicada durante a gestação. As técnicas vigorosas podem causar complicações." },
      { label: "Massagem Desportiva Intensa", correct: false, explanation: "Contraindicada na gravidez. A intensidade pode ser prejudicial para mãe e bebê." },
    ],
  },
];

export interface TreatmentPlan {
  id: string;
  title: string;
  emoji: string;
  description: string;
  duration: string;
  steps: {
    order: number;
    title: string;
    description: string;
    duration: string;
  }[];
  indications: string[];
  contraindications: string[];
}

export const treatmentPlans: TreatmentPlan[] = [
  {
    id: "plan-relaxante",
    title: "Massagem Relaxante Completa",
    emoji: "🧘",
    description: "Protocolo completo de massagem relaxante para alívio do estresse e tensão muscular.",
    duration: "60 minutos",
    steps: [
      { order: 1, title: "Preparação do Ambiente", description: "Ajuste a temperatura, iluminação e som ambiente. Prepare os óleos e toalhas.", duration: "5 min" },
      { order: 2, title: "Anamnese Rápida", description: "Pergunte ao cliente sobre áreas de tensão, alergias e condições especiais.", duration: "5 min" },
      { order: 3, title: "Membros Inferiores (posterior)", description: "Deslizamentos longos, amassamentos e fricções nas panturrilhas e coxas.", duration: "10 min" },
      { order: 4, title: "Costas e Lombares", description: "Deslizamentos profundos, amassamentos e digitopressão ao longo da coluna.", duration: "15 min" },
      { order: 5, title: "Ombros e Pescoço", description: "Fricções circulares, compressões e digitopressão nos pontos de tensão.", duration: "10 min" },
      { order: 6, title: "Membros Superiores", description: "Deslizamentos e amassamentos nos braços e mãos.", duration: "5 min" },
      { order: 7, title: "Massagem Facial", description: "Movimentos suaves no rosto e couro cabeludo para relaxamento completo.", duration: "5 min" },
      { order: 8, title: "Finalização", description: "Movimentos de alisamento para encerrar. Ofereça água ao cliente.", duration: "5 min" },
    ],
    indications: ["Estresse", "Tensão muscular", "Insônia", "Ansiedade", "Fadiga"],
    contraindications: ["Febre", "Infecções de pele", "Trombose", "Fraturas recentes"],
  },
  {
    id: "plan-drenagem",
    title: "Drenagem Linfática Corporal",
    emoji: "💧",
    description: "Protocolo de drenagem linfática para redução de inchaço e desintoxicação.",
    duration: "50 minutos",
    steps: [
      { order: 1, title: "Preparação", description: "Ambiente calmo, cliente em decúbito dorsal. Verificar contraindicações.", duration: "5 min" },
      { order: 2, title: "Ativação de Linfonodos Cervicais", description: "Movimentos suaves e rítmicos na região do pescoço para abrir as vias linfáticas.", duration: "5 min" },
      { order: 3, title: "Drenagem dos Membros Superiores", description: "Movimentos de bombeamento suave dos dedos até axilas.", duration: "8 min" },
      { order: 4, title: "Drenagem do Tórax", description: "Movimentos circulares suaves no tórax seguindo o fluxo linfático.", duration: "5 min" },
      { order: 5, title: "Drenagem Abdominal", description: "Movimentos circulares no abdômen, sentido horário, com pressão leve.", duration: "7 min" },
      { order: 6, title: "Drenagem dos Membros Inferiores", description: "Bombeamento dos pés até a virilha, seguindo os vasos linfáticos.", duration: "12 min" },
      { order: 7, title: "Drenagem das Costas", description: "Movimentos suaves das laterais para a coluna vertebral.", duration: "5 min" },
      { order: 8, title: "Fechamento", description: "Ativação final dos linfonodos. Orientar hidratação abundante.", duration: "3 min" },
    ],
    indications: ["Retenção de líquidos", "Pernas cansadas", "Pós-operatório (com liberação médica)", "Celulite", "Desintoxicação"],
    contraindications: ["Trombose venosa profunda", "Insuficiência cardíaca", "Infecções ativas", "Câncer sem liberação médica"],
  },
  {
    id: "plan-dor",
    title: "Alívio de Dor Muscular",
    emoji: "💪",
    description: "Protocolo focado no alívio de dores musculares e tensões localizadas.",
    duration: "45 minutos",
    steps: [
      { order: 1, title: "Avaliação da Dor", description: "Identifique a localização exata, intensidade (escala 0-10) e tipo de dor.", duration: "5 min" },
      { order: 2, title: "Aquecimento da Região", description: "Deslizamentos superficiais para aquecer e preparar os tecidos.", duration: "5 min" },
      { order: 3, title: "Técnicas de Amassamento", description: "Amassamentos profundos na região afetada para liberar aderências.", duration: "10 min" },
      { order: 4, title: "Fricção Transversa", description: "Fricções perpendiculares às fibras musculares nos pontos-gatilho.", duration: "8 min" },
      { order: 5, title: "Digitopressão", description: "Pressão sustentada nos trigger points por 10-15 segundos cada.", duration: "7 min" },
      { order: 6, title: "Alongamento Passivo", description: "Alongamentos suaves da musculatura trabalhada.", duration: "5 min" },
      { order: 7, title: "Crioterapia/Finalização", description: "Se indicado, aplique compressa fria. Finalize com deslizamentos suaves.", duration: "5 min" },
    ],
    indications: ["Dor muscular localizada", "Tensão cervical", "Lombalgia", "Contratura muscular", "Dor pós-exercício"],
    contraindications: ["Lesão aguda (primeiras 48h)", "Inflamação com calor local", "Fraturas", "Hérnia de disco aguda"],
  },
];
