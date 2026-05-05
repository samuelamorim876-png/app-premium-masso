export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LessonCuriosity {
  text: string;
}

// Curiosities mapped by lesson ID
export const lessonCuriosities: Record<string, LessonCuriosity> = {
  "mc1-1": { text: "Você sabia que o toque terapêutico é uma das formas mais antigas de cura? Registros de massoterapia datam de mais de 5.000 anos!" },
  "mc1-2": { text: "A história da massagem remonta ao Egito Antigo, China e Índia, onde era usada como tratamento médico principal." },
  "5-1": { text: "Os óleos essenciais usados na massoterapia podem potencializar os efeitos terapêuticos em até 40%!" },
  "6-1": { text: "O corpo humano possui mais de 600 músculos, e a massoterapia pode trabalhar diretamente em centenas deles." },
  "7-1": { text: "A ética profissional na massoterapia não é apenas uma regra — é o que diferencia um profissional respeitado no mercado." },
  "8-1": { text: "A massagem relaxante pode reduzir os níveis de cortisol (hormônio do estresse) em até 30% em uma única sessão!" },
  "9-1": { text: "A drenagem linfática movimenta cerca de 2 litros de linfa por dia no corpo, ajudando na desintoxicação natural." },
  "10-1": { text: "Cada pé possui mais de 7.000 terminações nervosas conectadas a diferentes órgãos do corpo!" },
  "12-1": { text: "A massagem modeladora combina técnicas de drenagem e amassamento para remodelar o contorno corporal." },
  "13-1": { text: "A auriculoterapia reconhece mais de 200 pontos na orelha, cada um conectado a uma parte diferente do corpo." },
  "14-1": { text: "A moxabustão é usada há mais de 2.500 anos na medicina tradicional chinesa para aquecer e estimular pontos de acupuntura." },
};

// Quizzes mapped by lesson ID
export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  "mc1-1": [
    {
      question: "Qual é uma das principais funções do toque terapêutico na massoterapia?",
      options: ["Apenas relaxamento muscular", "Estimular a circulação e promover bem-estar", "Substituir tratamentos médicos", "Diagnosticar doenças"],
      correctIndex: 1,
    },
  ],
  "6-1": [
    {
      question: "Por que é importante estudar anatomia na massoterapia?",
      options: ["Para impressionar os clientes", "Para conhecer a estrutura muscular e aplicar técnicas corretas", "Não é necessário", "Apenas por exigência legal"],
      correctIndex: 1,
    },
  ],
  "8-1": [
    {
      question: "Qual o principal objetivo da massagem relaxante?",
      options: ["Ganho de massa muscular", "Redução do estresse e tensão muscular", "Tratamento de fraturas", "Aumento da pressão arterial"],
      correctIndex: 1,
    },
    {
      question: "Qual hormônio é reduzido durante uma massagem relaxante?",
      options: ["Serotonina", "Dopamina", "Cortisol", "Adrenalina"],
      correctIndex: 2,
    },
  ],
  "9-1": [
    {
      question: "Qual sistema do corpo a drenagem linfática trabalha diretamente?",
      options: ["Sistema digestivo", "Sistema linfático", "Sistema nervoso central", "Sistema respiratório"],
      correctIndex: 1,
    },
  ],
  "10-1": [
    {
      question: "Quantas terminações nervosas aproximadamente existem em cada pé?",
      options: ["1.000", "3.000", "7.000", "15.000"],
      correctIndex: 2,
    },
  ],
  "13-1": [
    {
      question: "Em qual parte do corpo a auriculoterapia é aplicada?",
      options: ["Mãos", "Pés", "Orelhas", "Costas"],
      correctIndex: 2,
    },
  ],
};

// Daily challenges pool
export const dailyChallengesPool = [
  { title: "Revisão Rápida", description: "Reveja os principais conceitos da última aula que você assistiu e anote 3 pontos importantes." },
  { title: "Prática de Palpação", description: "Pratique a palpação em seu próprio braço, identificando os músculos bíceps e tríceps." },
  { title: "Respiração Consciente", description: "Faça 5 minutos de respiração diafragmática, técnica essencial antes de iniciar uma sessão." },
  { title: "Auto-massagem", description: "Aplique uma técnica de auto-massagem nos pés por 10 minutos, observando os pontos de tensão." },
  { title: "Estudo de Anatomia", description: "Estude a localização de 5 músculos das costas e suas funções principais." },
  { title: "Observação Postural", description: "Observe a postura de 3 pessoas ao longo do dia e identifique padrões de tensão muscular." },
  { title: "Técnica de Deslizamento", description: "Pratique movimentos de deslizamento superficial em seu antebraço por 5 minutos." },
  { title: "Leitura Complementar", description: "Leia um artigo sobre os benefícios da massoterapia para saúde mental e anote os pontos-chave." },
  { title: "Exercício de Mãos", description: "Faça exercícios de fortalecimento das mãos: abra e feche 20 vezes, depois alongue os dedos." },
  { title: "Meditação Terapêutica", description: "Medite por 10 minutos focando na intenção de cura e bem-estar que você transmitirá aos pacientes." },
  { title: "Revisão de Ética", description: "Releia as principais normas éticas do profissional de massoterapia e reflita sobre sua importância." },
  { title: "Prática de Pressão", description: "Pratique diferentes níveis de pressão em uma almofada: leve, média e firme. Sinta a diferença." },
  { title: "Conhecendo Óleos", description: "Pesquise sobre 3 óleos essenciais usados em massoterapia e seus benefícios específicos." },
  { title: "Alongamento Profissional", description: "Faça uma sequência de 10 minutos de alongamento — essencial para o massoterapeuta se manter saudável." },
];
