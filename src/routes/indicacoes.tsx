import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  title: string;
  emoji: string;
  content: string;
}

const topics: Topic[] = [
  {
    id: "t1", title: "Indicações Gerais da Massoterapia", emoji: "✅",
    content: `A massoterapia é indicada para uma ampla variedade de condições físicas e emocionais, sendo uma das terapias complementares mais versáteis disponíveis. Suas indicações incluem o alívio de dores musculares crônicas e agudas, redução do estresse e da ansiedade, melhora da qualidade do sono e promoção do relaxamento profundo. Pacientes com tensão muscular decorrente de má postura, esforço repetitivo ou sedentarismo são candidatos ideais para sessões regulares de massoterapia.

Além disso, a massoterapia é frequentemente indicada como terapia complementar no tratamento de condições como fibromialgia, síndrome miofascial, cefaleia tensional e dores articulares. Profissionais de saúde recomendam a massoterapia para pacientes em recuperação de lesões musculoesqueléticas, atletas que buscam otimizar a performance e pessoas que sofrem com problemas circulatórios leves.

A terapia também é benéfica para populações específicas, como idosos com perda de mobilidade, gestantes (com protocolos adaptados) e trabalhadores que passam longas horas em posições estáticas. O tratamento pode ser preventivo, terapêutico ou paliativo, dependendo das necessidades individuais de cada paciente. A avaliação prévia (anamnese) é fundamental para determinar a indicação correta e o protocolo mais adequado para cada caso.`
  },
  {
    id: "t2", title: "Benefícios Terapêuticos da Massagem", emoji: "💪",
    content: `Os benefícios terapêuticos da massoterapia são amplamente documentados na literatura científica e vão muito além do simples relaxamento. No aspecto musculoesquelético, a massagem promove o relaxamento de músculos tensos, redução de espasmos musculares, melhora da flexibilidade e amplitude de movimento, e aceleração da recuperação após exercícios intensos. A manipulação dos tecidos moles estimula a circulação local, favorecendo a nutrição celular e a remoção de metabólitos.

Do ponto de vista neurológico, a massoterapia estimula a liberação de neurotransmissores como serotonina, dopamina e endorfinas — substâncias responsáveis pela sensação de bem-estar e pela modulação natural da dor. Estudos demonstram que sessões regulares de massagem podem reduzir os níveis de cortisol (hormônio do estresse) em até 30%, contribuindo significativamente para o equilíbrio hormonal e emocional do paciente.

No sistema imunológico, pesquisas indicam que a massoterapia pode aumentar a atividade das células NK (Natural Killer), fortalecendo as defesas naturais do organismo. Pacientes que recebem massagem regular apresentam menor incidência de doenças oportunistas e melhor resposta imunológica geral. Esses benefícios combinados tornam a massoterapia uma ferramenta poderosa na promoção da saúde integral, atuando simultaneamente nos aspectos físico, mental e emocional.`
  },
  {
    id: "t3", title: "Efeitos Fisiológicos da Massagem", emoji: "🔬",
    content: `A massagem produz efeitos fisiológicos significativos em múltiplos sistemas do corpo humano. No sistema circulatório, a pressão mecânica aplicada durante a massagem favorece o retorno venoso e linfático, melhorando a oxigenação dos tecidos e a remoção de toxinas metabólicas. O aumento do fluxo sanguíneo local eleva a temperatura tecidual, promovendo maior elasticidade das fibras musculares e conectivas.

No sistema nervoso, a massagem atua através de mecanoreceptores cutâneos que enviam sinais aferentes ao sistema nervoso central. Técnicas lentas e rítmicas ativam o sistema nervoso parassimpático, promovendo relaxamento, redução da frequência cardíaca e da pressão arterial. Já técnicas vigorosas e rápidas ativam o simpático, sendo utilizadas para estimulação pré-competição em atletas. O Mecanismo de Portão da Dor (Gate Control Theory) explica como o toque terapêutico pode bloquear a transmissão de sinais dolorosos.

No sistema musculoesquelético, a massagem promove a redução do tônus muscular excessivo, quebra de aderências entre fáscias e músculos, e melhora da propriocepção. O aumento da produção de ácido hialurônico nas fáscias melhora o deslizamento entre camadas teciduais. A estimulação dos órgãos tendinosos de Golgi reduz reflexamente a tensão muscular, enquanto a ativação dos fusos musculares pode aumentar o tônus quando necessário. Esses mecanismos fisiológicos fundamentam cientificamente a eficácia da massoterapia.`
  },
  {
    id: "t4", title: "Relaxamento Muscular e Técnicas", emoji: "🧘",
    content: `O relaxamento muscular é um dos objetivos primários da massoterapia e pode ser alcançado através de diversas técnicas específicas. O deslizamento (effleurage) é a técnica mais básica e fundamental, utilizando movimentos longos e fluidos que acompanham o sentido das fibras musculares, promovendo aquecimento tecidual e preparação para técnicas mais profundas. A pressão deve ser progressiva, iniciando-se de forma suave e aumentando gradualmente conforme a tolerância do paciente.

O amassamento (petrissage) trabalha a musculatura de forma mais profunda, utilizando movimentos de compressão, torção e rolamento dos tecidos. Esta técnica é especialmente eficaz para músculos com contratura crônica, pois promove o alongamento das fibras musculares e a liberação de trigger points (pontos-gatilho). A digitopressão complementa o trabalho, aplicando pressão sustentada em pontos específicos para liberar tensão localizada.

Técnicas avançadas como a liberação miofascial trabalham as fáscias (tecido conectivo que envolve os músculos), utilizando pressão lenta e sustentada para restaurar a mobilidade entre camadas teciduais. A Inibição Neuromuscular utiliza contrações isométricas seguidas de alongamento passivo para reprogramar o comprimento muscular. O massoterapeuta deve dominar a progressão entre técnicas, começando sempre pelo superficial e avançando para o profundo, respeitando a resposta individual de cada paciente ao tratamento.`
  },
  {
    id: "t5", title: "Circulação Sanguínea e Massoterapia", emoji: "❤️",
    content: `A massoterapia exerce influência direta sobre o sistema circulatório através de mecanismos mecânicos e reflexos. A aplicação de pressão e deslizamento no sentido do retorno venoso auxilia na condução do sangue de volta ao coração, melhorando a circulação periférica especialmente em membros inferiores. Este efeito é particularmente benéfico para pessoas que permanecem longos períodos em pé ou sentadas, prevenindo o acúmulo de sangue venoso e o consequente edema.

A vasodilatação local provocada pela massagem aumenta o fluxo sanguíneo na região tratada, elevando a oferta de oxigênio e nutrientes às células. Esse aumento da perfusão tecidual acelera processos de cicatrização e regeneração, sendo extremamente valioso em programas de recuperação pós-lesão. A liberação de histamina e óxido nítrico durante a massagem contribui para a vasodilatação e melhora da microcirculação capilar.

Na drenagem linfática, as técnicas são especificamente desenhadas para estimular o sistema linfático, que não possui bomba própria (como o coração para o sangue). Os movimentos lentos, rítmicos e com pressão muito leve (30-40 mmHg) estimulam a contração dos linfangions (segmentos dos vasos linfáticos), melhorando a absorção de líquidos intersticiais e reduzindo edemas. A compreensão desses mecanismos circulatórios é fundamental para que o massoterapeuta aplique as técnicas corretas com a pressão adequada, maximizando os benefícios e evitando efeitos adversos.`
  },
  {
    id: "t6", title: "Estresse e Ansiedade: Papel da Massoterapia", emoji: "🧠",
    content: `O estresse crônico e a ansiedade são condições cada vez mais prevalentes na sociedade moderna, e a massoterapia oferece uma abordagem terapêutica eficaz e não farmacológica para seu manejo. O mecanismo de ação principal envolve a ativação do sistema nervoso parassimpático através do toque terapêutico, que desencadeia a resposta de relaxamento descrita por Herbert Benson — redução da frequência cardíaca, diminuição da pressão arterial, relaxamento muscular e desaceleração da respiração.

Pesquisas demonstram que uma única sessão de massagem de 60 minutos pode reduzir significativamente os níveis de cortisol salivar e aumentar os níveis de serotonina e dopamina. Em pacientes com transtorno de ansiedade generalizada, programas de massoterapia regular (2-3 sessões semanais por 4-6 semanas) mostraram resultados comparáveis a abordagens farmacológicas de primeira linha, com a vantagem de não apresentar efeitos colaterais.

O ambiente terapêutico também desempenha papel crucial no manejo do estresse. A combinação de música relaxante (preferencialmente em 60 BPM), aromaterapia com óleos essenciais calmantes (lavanda, camomila, ylang-ylang), iluminação suave e temperatura agradável (24-26°C) potencializa os efeitos da massagem. O massoterapeuta deve desenvolver sensibilidade para adaptar sua abordagem — pacientes muito ansiosos podem inicialmente apresentar dificuldade em relaxar, necessitando de técnicas gradativas e comunicação reasseguradora durante as primeiras sessões.`
  },
  {
    id: "t7", title: "Dores Musculares: Avaliação e Tratamento", emoji: "💆",
    content: `A avaliação e o tratamento de dores musculares requerem do massoterapeuta conhecimento anatômico sólido e capacidade de raciocínio clínico. O primeiro passo é sempre a anamnese detalhada: localização precisa da dor, intensidade (escala 0-10), tipo de dor (pontada, queimação, peso, latejante), fatores que pioram ou melhoram, duração e frequência. A palpação subsequente permite identificar pontos-gatilho, espasmos, edema e alterações de temperatura nos tecidos.

O tratamento deve ser direcionado pela causa identificada. Para dores de origem postural (como as causadas por longas horas sentado), o foco deve ser na descontração dos músculos encurtados e no estímulo dos músculos enfraquecidos. Para dores por esforço repetitivo, técnicas de liberação miofascial e digitopressão nos pontos-gatilho são mais indicadas. Dores agudas pós-exercício (DOMS) respondem bem à massagem desportiva com pressão moderada para aumentar o fluxo sanguíneo e acelerar a remoção de metabólitos.

É fundamental que o massoterapeuta saiba diferenciar dores musculares de dores com outras origens (visceral, neuropática, óssea) que requerem encaminhamento médico. Sinais de alerta incluem: dor que não melhora com repouso, dor noturna que acorda o paciente, febre associada, perda de peso inexplicada, dor irradiada com alteração de sensibilidade e histórico de trauma significativo. A massoterapia é uma terapia complementar poderosa, mas o profissional deve conhecer seus limites de atuação.`
  },
  {
    id: "t8", title: "Recuperação Pós-Treino e Massagem Desportiva", emoji: "🏃",
    content: `A massagem desportiva é uma especialidade da massoterapia voltada para atletas e praticantes de atividade física, com foco na otimização da performance e aceleração da recuperação. A aplicação pós-treino é a mais comum e visa reduzir a dor muscular tardia (DOMS — Delayed Onset Muscle Soreness), que ocorre 24-72 horas após exercícios intensos ou não habituais. O mecanismo da DOMS envolve microlesões nas fibras musculares, edema intramuscular e resposta inflamatória local.

A massagem de recuperação deve ser aplicada idealmente entre 2 e 48 horas após o exercício. As técnicas incluem deslizamentos profundos seguindo a direção das fibras musculares, amassamento suave para drenar o edema intramuscular, e compressão rítmica para estimular a circulação. A pressão deve ser moderada — pressão excessiva sobre músculos já inflamados pode agravar o quadro. Estudos mostram que a massagem pós-exercício pode reduzir a percepção de dor em até 30% e acelerar a recuperação funcional em 1-2 dias.

Além da recuperação, a massagem desportiva pode ser aplicada pré-competição (técnicas estimulantes para preparar a musculatura), durante intervalos (manutenção da flexibilidade e redução de cãibras) e como manutenção regular (prevenção de lesões crônicas). O massoterapeuta desportivo deve compreender as demandas específicas de cada esporte e adaptar os protocolos de acordo com a fase de treinamento do atleta (periodização). A comunicação com o preparador físico e o fisioterapeuta é essencial para resultados ótimos.`
  },
  {
    id: "t9", title: "Qualidade do Sono e Massoterapia", emoji: "😴",
    content: `A insônia e os distúrbios do sono afetam uma parcela significativa da população mundial, e a massoterapia surge como uma alternativa terapêutica natural e eficaz. O mecanismo pelo qual a massagem melhora o sono está relacionado à modulação do sistema nervoso autônomo: a ativação parassimpática durante a massagem reduz a excitação cortical, diminui a frequência cardíaca e promove o estado de relaxamento necessário para a indução do sono. Além disso, o aumento da serotonina induzido pela massagem é substrato para a produção de melatonina, o hormônio regulador do ciclo sono-vigília.

Protocolos específicos para melhora do sono incluem massagem relaxante completa com ênfase na região cervical e craniana, realizados preferencialmente no período noturno (até 2 horas antes de dormir). Técnicas de acupressão em pontos específicos como o Anmian (atrás da orelha), Shenmen (punho) e Yongquan (planta do pé) potencializam o efeito indutor do sono. A massagem craniana com movimentos circulares lentos no couro cabeludo é particularmente eficaz para desacelerar o pensamento e induzir sonolência.

Estudos clínicos demonstram que programas de massoterapia regular (3 vezes por semana por 4 semanas) podem aumentar a duração total do sono em até 36 minutos por noite, melhorar a eficiência do sono e reduzir o tempo de latência para adormecer. Em populações especiais como idosos, gestantes e pacientes oncológicos, a massoterapia para melhora do sono é particularmente valiosa por evitar os efeitos colaterais dos medicamentos hipnóticos.`
  },
  {
    id: "t10", title: "Contraindicações Gerais da Massoterapia", emoji: "⛔",
    content: `As contraindicações da massoterapia podem ser classificadas em absolutas (onde a massagem não deve ser realizada em nenhuma circunstância) e relativas (onde a massagem pode ser realizada com adaptações e cuidados). As contraindicações absolutas incluem: trombose venosa profunda (TVP) — a manipulação pode deslocar um trombo causando embolia pulmonar; febre acima de 38°C — indica processo infeccioso ativo que pode ser disseminado; tumores malignos sem liberação oncológica — risco de metastatização; fraturas recentes não consolidadas; e infecções cutâneas contagiosas na área a ser tratada.

As contraindicações relativas requerem avaliação caso a caso e frequentemente necessitam de liberação médica. Incluem: hipertensão arterial não controlada, diabetes descompensado, osteoporose severa, varizes de grau avançado, gravidez (especialmente primeiro trimestre), uso de anticoagulantes, doenças autoimunes em fase ativa, e cirurgias recentes. Nestas situações, a massagem pode ser realizada com protocolos adaptados, pressão reduzida e evitando áreas específicas.

Contraindicações locais referem-se a regiões específicas onde a massagem deve ser evitada: sobre feridas abertas, queimaduras, erupções cutâneas, hematomas recentes, áreas com perda de sensibilidade, sobre implantes ou dispositivos médicos, e diretamente sobre proeminências ósseas inflamadas. O massoterapeuta deve conduzir uma anamnese completa antes de cada sessão, atualizando informações sobre medicações, condições de saúde recentes e quaisquer procedimentos médicos. Na dúvida, a regra é sempre encaminhar para avaliação médica antes de prosseguir.`
  },
  {
    id: "t11", title: "Quando Não Aplicar Massagem", emoji: "🚫",
    content: `Reconhecer situações em que a massagem é contraindicada é tão importante quanto dominar as técnicas de aplicação. O massoterapeuta deve desenvolver um "senso clínico" para identificar sinais de alerta (red flags) que indicam a necessidade de encaminhamento médico antes de qualquer intervenção. A segurança do paciente sempre deve ser a prioridade absoluta, mesmo que isso signifique recusar um atendimento.

Não aplique massagem quando o paciente apresentar: estado febril, sinais de infecção sistêmica (calafrios, mal-estar, sudorese), dor torácica de origem desconhecida, dificuldade respiratória, confusão mental, alterações neurológicas súbitas (formigamento, perda de força, alteração da fala), sangramento ativo ou recente, reação alérgica em curso, ou qualquer condição aguda que necessite de atendimento médico de emergência. Nestas situações, oriente o paciente a procurar atendimento médico imediato.

Em casos menos urgentes mas igualmente importantes, adie a massagem quando: o paciente está sob efeito de álcool ou drogas (percepção de dor alterada), acabou de fazer uma refeição pesada (risco de náusea), apresenta queimadura solar extensa, fez aplicação recente de toxina botulínica na região, está no pós-operatório imediato sem liberação médica, ou apresenta estado emocional extremamente alterado (crise de pânico, choro incontrolável). A comunicação empática e profissional ao explicar a necessidade de adiar o atendimento fortalece a relação de confiança com o paciente.`
  },
  {
    id: "t12", title: "Cuidados com Doenças Crônicas", emoji: "🏥",
    content: `Pacientes com doenças crônicas representam uma parcela significativa da clientela de massoterapia e requerem atenção especial na avaliação e no planejamento do tratamento. O massoterapeuta deve compreender as implicações de condições como diabetes, hipertensão, artrite reumatoide, lúpus, esclerose múltipla e doenças cardiovasculares para adaptar adequadamente suas técnicas e evitar complicações.

No diabetes, a neuropatia periférica pode reduzir a sensibilidade, impedindo que o paciente sinalize dor durante a massagem. A fragilidade capilar aumenta o risco de hematomas, e a cicatrização comprometida torna qualquer lesão cutânea potencialmente grave. Sempre verifique a glicemia antes da sessão e não realize massagem se os valores estiverem abaixo de 70 mg/dL ou acima de 250 mg/dL. Na hipertensão, evite técnicas vigorosas que possam elevar transitoriamente a pressão arterial — prefira massagem relaxante com pressão suave a moderada.

Em doenças autoimunes, as fases de exacerbação (flare-ups) são contraindicações relativas, pois a estimulação mecânica pode intensificar a resposta inflamatória sistêmica. Durante as fases de remissão, a massagem pode ser benéfica para alívio de dores residuais e melhora da qualidade de vida. Pacientes em uso de corticosteroides crônicos apresentam pele mais frágil e maior risco de equimoses. A comunicação constante com a equipe médica do paciente é fundamental, e o massoterapeuta deve solicitar e manter em arquivo a liberação médica por escrito para atender pacientes com condições crônicas complexas.`
  },
  {
    id: "t13", title: "Massoterapia em Gestantes: Cuidados Essenciais", emoji: "🤰",
    content: `A massoterapia durante a gestação oferece benefícios significativos quando realizada com protocolos adequados e por profissionais qualificados. Entre os benefícios comprovados estão o alívio de dores lombares (queixa presente em até 70% das gestantes), redução de edema nos membros inferiores, melhora da qualidade do sono, redução do estresse e da ansiedade pré-parto, e diminuição de sintomas de depressão gestacional. No entanto, a gravidez impõe modificações importantes nos protocolos de atendimento.

O primeiro trimestre (até 12 semanas) é considerado período de maior risco, e muitos profissionais optam por não atender gestantes nesta fase devido ao risco de aborto espontâneo (que embora não seja causado pela massagem, poderia ser erroneamente atribuído a ela). A partir do segundo trimestre, a massagem pode ser realizada com segurança seguindo protocolos específicos: posicionamento em decúbito lateral (nunca ventral a partir de 16 semanas), pressão suave a moderada, evitar a região sacral e pontos de acupressão que podem estimular contrações uterinas (como LI4 entre polegar e indicador, e SP6 acima do maléolo medial).

Contraindicações específicas na gestação incluem: pré-eclâmpsia, placenta prévia, sangramento vaginal, risco de parto prematuro, gestação de alto risco sem liberação obstétrica, trombose venosa, e diabetes gestacional descompensado. A massagem em gestantes deve ser mais curta (40-50 minutos), focada no alívio de desconfortos específicos, com transições suaves entre posições. A drenagem linfática adaptada nos membros inferiores é particularmente benéfica para o edema gestacional. Sempre exija liberação do obstetra por escrito antes de iniciar o acompanhamento.`
  },
  {
    id: "t14", title: "Inflamações e Lesões: Condutas Corretas", emoji: "🔥",
    content: `O manejo adequado de inflamações e lesões na massoterapia requer compreensão dos processos fisiológicos envolvidos e critério clínico para determinar quando, como e se a massagem deve ser aplicada. O processo inflamatório agudo apresenta cinco sinais clássicos: dor (dolor), calor (calor), vermelhidão (rubor), edema (tumor) e perda de função (functio laesa). Na presença desses sinais, a massagem direta sobre a região é geralmente contraindicada, pois pode aumentar a perfusão sanguínea local e agravar o processo inflamatório.

Na fase aguda de uma lesão (primeiras 48-72 horas), o protocolo PRICE (Proteção, Repouso, Ice/Gelo, Compressão, Elevação) é prioritário. A massagem pode ser aplicada em áreas distantes da lesão para alívio compensatório e manutenção da circulação geral. Após a fase aguda, na fase subaguda (3-21 dias), a massagem pode ser gradualmente introduzida ao redor da lesão (técnicas periféricas) com pressão muito leve, progredindo para a área afetada conforme a tolerância do paciente e a evolução da cicatrização.

Na fase de remodelamento (21 dias a 12 meses), técnicas como fricção transversa profunda de Cyriax podem ser aplicadas para orientar a formação de tecido cicatricial, prevenindo aderências disfuncionais. A liberação miofascial e o alongamento passivo auxiliam na recuperação da amplitude de movimento. O massoterapeuta deve sempre respeitar os limites de dor do paciente e progredir as técnicas gradualmente. Em lesões musculares (distensões) de grau II ou III, a liberação do fisioterapeuta ou médico é obrigatória antes de qualquer intervenção manual.`
  },
  {
    id: "t15", title: "Uso Seguro de Técnicas e Produtos", emoji: "🧴",
    content: `A segurança na prática da massoterapia envolve tanto a aplicação correta das técnicas manuais quanto o uso adequado de produtos e equipamentos auxiliares. No que diz respeito às técnicas, o princípio fundamental é a progressão gradual — sempre iniciar com pressão leve e aumentar conforme a tolerância do paciente. Técnicas de pressão profunda (como digitopressão, fricção transversa e liberação de trigger points) requerem formação específica e devem ser aplicadas com conhecimento anatômico preciso para evitar lesão de estruturas sensíveis como nervos, vasos e órgãos.

Quanto aos produtos, os óleos e cremes de massagem devem ser hipoalergênicos e de qualidade profissional. Antes da primeira sessão, realize sempre um teste de sensibilidade aplicando uma pequena quantidade do produto na face interna do antebraço do paciente e aguardando 15-20 minutos para verificar reações. Óleos essenciais devem ser sempre diluídos em óleos carreadores (nunca aplicados puros) na proporção máxima de 2-3% para adultos. Pacientes com pele sensível, alergias conhecidas, gestantes e crianças requerem concentrações ainda menores ou a exclusão total de óleos essenciais.

A biossegurança é igualmente crucial: higienize as mãos antes e após cada atendimento, utilize lençóis limpos e descartáveis ou troque entre pacientes, esterilize equipamentos reutilizáveis (pedras quentes, ventosas, bambus), mantenha as unhas curtas e limpas, e não atenda se estiver com qualquer infecção transmissível. O ambiente de trabalho deve ser ventilado, com temperatura controlada (24-26°C) e superfícies limpas. A manutenção de fichas de anamnese atualizadas e o registro de cada sessão protegem tanto o paciente quanto o profissional, documentando o tratamento realizado e a evolução do quadro.`
  },
];

export const Route = createFileRoute("/indicacoes")({
  head: () => ({ meta: [{ title: "Indicações e Contraindicações — Massoterapia" }] }),
  component: IndicacoesPage,
});

function IndicacoesPage() {
  const { user, loading } = useAuth();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Faça login para acessar.</p></div>;
  }

  const topic = topics.find((t) => t.id === activeTopic);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link to="/"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button></Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Indicações e Contraindicações</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {!topic ? (
          <>
            <div className="mb-6 animate-fade-up">
              <h1 className="font-heading text-2xl font-bold text-foreground">📖 Indicações e Contraindicações</h1>
              <p className="mt-1 text-sm text-muted-foreground">Conteúdo teórico aprofundado para fortalecer sua base profissional.</p>
            </div>
            <div className="space-y-3">
              {topics.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className="w-full group rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5 animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-foreground">{t.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Toque para ler</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-up">
            <button onClick={() => setActiveTopic(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
              <ArrowLeft className="h-3 w-3" /> Voltar aos tópicos
            </button>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{topic.emoji}</span>
                <h2 className="font-heading text-xl font-bold text-foreground">{topic.title}</h2>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {topic.content.split("\n\n").map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/85 mb-4">{p}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
