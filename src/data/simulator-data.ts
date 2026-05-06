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
    description: "Paciente de 45 anos, trabalha sentado por 8 horas diárias em escritório. Relata dor lombar persistente há 3 meses, que piora ao final do dia. Não pratica atividade física regular. Exames descartaram hérnia de disco.",
    patientComplaint: "Sinto uma dor constante na parte baixa das costas, que piora no final do dia. Às vezes irradia para o glúteo. Já fiz exames e não tenho hérnia.",
    options: [
      { label: "Massagem Relaxante com foco lombar + alongamento passivo", correct: true, explanation: "Correto! A combinação de massagem relaxante com foco na região lombar (deslizamentos profundos, amassamento e digitopressão nos paravertebrais) junto com alongamento passivo dos músculos iliopsoas e quadrado lombar é a abordagem ideal. A dor postural responde muito bem a essa combinação, aliviando a tensão acumulada e restaurando a mobilidade." },
      { label: "Drenagem Linfática corporal", correct: false, explanation: "Incorreto. A drenagem linfática é indicada para retenção de líquidos e edemas, não para dor muscular de origem postural. A técnica utiliza pressão muito leve que não alcança a profundidade necessária para aliviar a tensão na musculatura lombar. A abordagem correta seria massagem com técnicas de amassamento e digitopressão." },
      { label: "Reflexologia Podal isolada", correct: false, explanation: "Incorreto como tratamento principal. Embora a reflexologia possa estimular pontos reflexos relacionados à coluna, para uma dor lombar crônica postural, a abordagem direta na região com massagem terapêutica é significativamente mais eficaz. A reflexologia poderia ser um complemento, mas não o tratamento primário." },
      { label: "Massagem Modeladora na região", correct: false, explanation: "Incorreto. A massagem modeladora utiliza movimentos vigorosos e rápidos voltados para remodelação corporal e redução de medidas. Aplicá-la sobre uma região com dor crônica poderia agravar o quadro. O paciente necessita de técnicas que relaxem e descontraiam a musculatura, não que a estimulem intensamente." },
    ],
  },
  {
    id: "sim-2",
    title: "Estresse e Insônia",
    description: "Paciente de 32 anos, executiva de multinacional. Relata insônia há 2 meses, tensão severa nos ombros e pescoço, e bruxismo noturno. Apresenta sinais de estresse elevado: irritabilidade, cansaço e dificuldade de concentração.",
    patientComplaint: "Não consigo dormir direito há meses, acordo com a mandíbula travada e sinto muita tensão no pescoço e ombros. Estou exausta mas não relaxo.",
    options: [
      { label: "Massagem Relaxante Completa com ênfase cervical", correct: true, explanation: "Correto! A massagem relaxante completa reduz significativamente os níveis de cortisol (hormônio do estresse) e promove a liberação de serotonina e endorfinas. A ênfase na região cervical e temporal alivia diretamente a tensão que contribui para o bruxismo. Recomende sessões semanais por pelo menos 4 semanas para resultados duradouros." },
      { label: "Massagem Desportiva Intensa", correct: false, explanation: "Incorreto. A massagem desportiva utiliza técnicas intensas e vigorosas que podem aumentar temporariamente a excitação do sistema nervoso simpático — exatamente o oposto do que esta paciente precisa. Ela necessita de técnicas que ativem o sistema parassimpático para induzir relaxamento profundo." },
      { label: "Moxabustão como tratamento único", correct: false, explanation: "Incorreto como abordagem isolada. Embora a moxabustão tenha benefícios para o equilíbrio energético, a paciente apresenta um quadro complexo que demanda uma abordagem mais abrangente. A massagem relaxante seria a base do tratamento, com a moxabustão como possível complemento em sessões futuras." },
      { label: "Massagem Modeladora no Abdômen", correct: false, explanation: "Totalmente inadequado. A massagem modeladora abdominal não tem relação com o quadro de estresse e insônia. Além disso, os movimentos vigorosos da modeladora podem gerar desconforto e ansiedade em uma paciente já hiperestimulada." },
    ],
  },
  {
    id: "sim-3",
    title: "Pernas Cansadas e Edema",
    description: "Paciente de 55 anos, professora que passa 6 horas em pé. Queixa-se de pernas pesadas, inchaço bilateral nos tornozelos e sensação de formigamento ao final do dia. Sem histórico de trombose. Usa meias de compressão esporadicamente.",
    patientComplaint: "Minhas pernas ficam muito pesadas e inchadas, especialmente à noite. Os tornozelos ficam marcados quando tiro a meia. Às vezes sinto formigamento nos pés.",
    options: [
      { label: "Drenagem Linfática nos Membros Inferiores", correct: true, explanation: "Correto! A drenagem linfática é a técnica de excelência para edema de membros inferiores. Os movimentos lentos, rítmicos e com pressão suave (30-40 mmHg) estimulam o retorno linfático, reduzindo o inchaço. Inicie sempre proximal (virilha) para depois drenar distal (pés). Oriente a paciente sobre elevação das pernas e uso regular das meias de compressão." },
      { label: "Massagem Modeladora nas Pernas", correct: false, explanation: "Incorreto. A massagem modeladora utiliza movimentos rápidos, firmes e vigorosos que podem agravar o edema e causar hematomas em tecidos já comprometidos pela retenção de líquidos. A pressão excessiva pode danificar capilares superficiais em uma paciente com circulação comprometida." },
      { label: "Reflexologia Podal como único tratamento", correct: false, explanation: "Insuficiente como tratamento isolado. A reflexologia pode melhorar a circulação local nos pés, mas não possui a eficácia da drenagem linfática para tratar o edema bilateral de membros inferiores. Poderia ser usada como complemento, nunca como tratamento principal neste caso." },
      { label: "Massagem Relaxante Facial", correct: false, explanation: "Completamente inadequado. A massagem facial não tem qualquer relação com a queixa de edema e peso nos membros inferiores. A abordagem precisa ser direcionada à região afetada com técnicas específicas para o sistema linfático." },
    ],
  },
  {
    id: "sim-4",
    title: "Cefaleia Tensional Recorrente",
    description: "Paciente de 28 anos, desenvolvedor de software. Relata dores de cabeça quase diárias, localizadas na região frontal e temporal, associadas a rigidez na nuca. Usa computador por 10h/dia. Já consultou neurologista que descartou causas graves.",
    patientComplaint: "Tenho dores de cabeça quase todos os dias, parece uma pressão na testa e nos lados da cabeça. A nuca fica muito dura e às vezes a dor desce para os ombros.",
    options: [
      { label: "Massagem Cervical + Craniana com digitopressão", correct: true, explanation: "Correto! A cefaleia tensional está diretamente ligada à contratura dos músculos trapézio superior, esternocleidomastoideo e suboccipitais. A massagem cervical com digitopressão nos pontos-gatilho dessa musculatura, combinada com massagem craniana suave (técnicas de deslizamento e pressão no couro cabeludo), proporciona alívio significativo. Oriente sobre ergonomia e pausas durante o trabalho." },
      { label: "Drenagem Linfática Facial", correct: false, explanation: "Inadequado. A drenagem linfática facial trabalha com pressão muito leve e é voltada para edema facial, não para tensão muscular cervical. O paciente precisa de técnicas que alcancem a musculatura profunda do pescoço e base do crânio, onde está a origem da dor." },
      { label: "Massagem Modeladora nos Braços", correct: false, explanation: "Sem relação com o quadro. A modeladora nos braços não aborda a causa da cefaleia. O tratamento deve focar na região cervical, suboccipital e temporal, onde a tensão está gerando a dor referida." },
      { label: "Auriculoterapia como tratamento isolado", correct: false, explanation: "Insuficiente como terapia única. A auriculoterapia pode complementar o tratamento estimulando pontos relacionados a dor e relaxamento, mas a abordagem manual direta na musculatura cervical é essencial como tratamento primário para cefaleia tensional crônica." },
    ],
  },
  {
    id: "sim-5",
    title: "Recuperação Pós-Treino Intenso",
    description: "Paciente de 35 anos, praticante de CrossFit há 2 anos. Procura atendimento 24 horas após treino intenso de membros inferiores. Apresenta dor muscular tardia (DOMS) generalizada em quadríceps, isquiotibiais e panturrilhas.",
    patientComplaint: "Treinei pernas ontem no CrossFit e mal consigo andar. As coxas e panturrilhas estão muito doloridas. Tenho competição no fim de semana e preciso me recuperar rápido.",
    options: [
      { label: "Massagem Desportiva de Recuperação", correct: true, explanation: "Correto! A massagem desportiva pós-exercício é a técnica ideal para DOMS. Utilize deslizamentos profundos, amassamento e compressão rítmica para aumentar o fluxo sanguíneo, remover metabólitos acumulados e reduzir o edema intramuscular. A pressão deve ser moderada (não intensa) pois o tecido já está inflamado. Pode reduzir o tempo de recuperação em até 30%." },
      { label: "Massagem Relaxante Suave", correct: false, explanation: "Parcialmente adequado mas insuficiente. A massagem relaxante usa pressão superficial que não alcança as camadas musculares profundas afetadas pela DOMS. O paciente é atleta e precisa de técnicas específicas da massagem desportiva que trabalhem a recuperação muscular de forma mais efetiva." },
      { label: "Drenagem Linfática", correct: false, explanation: "Inadequado como tratamento principal. A DOMS é um processo inflamatório muscular que requer técnicas de massagem que promovam circulação sanguínea profunda. A drenagem trabalha o sistema linfático superficial e não atinge a profundidade necessária para a recuperação muscular pós-exercício." },
      { label: "Moxabustão nos pontos de dor", correct: false, explanation: "Não indicado. A moxabustão gera calor localizado que pode agravar o processo inflamatório já presente na DOMS. Nas primeiras 48h pós-exercício intenso, o aquecimento excessivo pode aumentar o edema intramuscular e prolongar a recuperação." },
    ],
  },
  {
    id: "sim-6",
    title: "Gestante com Dor nas Costas",
    description: "Paciente grávida de 28 semanas (7 meses), primeira gestação. Queixa-se de dor lombar e dorsalgia por aumento do peso abdominal. Apresenta edema leve nos pés. Pré-natal sem complicações. Liberação médica para massagem.",
    patientComplaint: "Estou com muita dor nas costas por causa do peso da barriga, e meus pés estão inchados. Meu médico liberou massagem mas estou preocupada se é seguro.",
    options: [
      { label: "Massagem adaptada para Gestantes (decúbito lateral)", correct: true, explanation: "Correto! A massagem para gestantes deve seguir protocolos específicos: posição em decúbito lateral (deitada de lado) com almofadas de apoio, pressão suave a moderada, evitando a região sacral e pontos de acupressão que estimulam contrações (como LI4 e SP6). Foco na lombar, dorsais e membros inferiores. A drenagem leve nos pés pode complementar. Sempre com liberação médica prévia." },
      { label: "Massagem Relaxante Convencional (decúbito ventral)", correct: false, explanation: "Incorreto e potencialmente perigoso. A posição de decúbito ventral (barriga para baixo) é contraindicada a partir do segundo trimestre, pois comprime o útero e a veia cava inferior, podendo causar hipotensão e redução do fluxo sanguíneo para o feto. Gestantes devem ser posicionadas em decúbito lateral." },
      { label: "Massagem Modeladora", correct: false, explanation: "Totalmente contraindicada na gestação. As técnicas vigorosas da modeladora (amassamento forte, deslizamento rápido, percussão) podem provocar contrações uterinas, desconforto severo e risco de descolamento de placenta. Nunca aplique técnicas intensas em gestantes." },
      { label: "Massagem Desportiva Intensa nos membros", correct: false, explanation: "Contraindicada na gravidez. A pressão intensa da massagem desportiva pode causar hematomas (gestantes têm fragilidade capilar aumentada) e a estimulação vigorosa pode provocar contrações. A gestante precisa de técnicas suaves e adaptadas." },
    ],
  },
  {
    id: "sim-7",
    title: "Fibromialgia — Dor Generalizada",
    description: "Paciente de 48 anos, diagnosticada com fibromialgia há 5 anos. Apresenta dor difusa em múltiplos pontos (tender points), fadiga crônica, sono não reparador e sensibilidade ao toque. Em tratamento médico com reumatologista.",
    patientComplaint: "Tenho dor no corpo todo, em alguns dias não consigo nem que toquem em mim. O médico recomendou massagem mas tenho medo de doer mais.",
    options: [
      { label: "Massagem Relaxante suave com pressão gradual", correct: true, explanation: "Correto! Pacientes com fibromialgia requerem abordagem delicada e progressiva. Inicie com toque muito leve (effleurage superficial) e aumente a pressão gradualmente conforme a tolerância do paciente. Evite técnicas de pressão profunda e fricção vigorosa. Sessões mais curtas (30-40 min) são melhor toleradas. A massagem regular pode reduzir a dor e melhorar a qualidade do sono em pacientes fibromiálgicos." },
      { label: "Massagem Desportiva com pressão profunda", correct: false, explanation: "Contraindicado. A pressão profunda da massagem desportiva pode desencadear crises de dor intensa em pacientes fibromiálgicos, cujos limiares de dor são significativamente mais baixos. A estimulação excessiva dos tender points pode causar flare-up (crise de dor) que pode durar dias." },
      { label: "Massagem com percussão e tapotement", correct: false, explanation: "Contraindicado. Técnicas de percussão (tapotement) geram estímulos mecânicos intensos que são extremamente dolorosos para pacientes com fibromialgia. A hipersensibilidade central desses pacientes amplifica qualquer estímulo mecânico, transformando-o em dor intensa." },
      { label: "Massagem vigorosa para 'soltar' a musculatura", correct: false, explanation: "Perigosamente inadequado. A ideia de que músculos dolorosos precisam ser 'trabalhados com força' é um mito especialmente prejudicial para fibromiálgicos. A dor na fibromialgia tem origem neurológica (sensitização central) e técnicas vigorosas podem causar crises severas de dor que duram dias ou semanas." },
    ],
  },
  {
    id: "sim-8",
    title: "Idoso com Artrose nos Joelhos",
    description: "Paciente de 68 anos, aposentado, com artrose bilateral nos joelhos grau II-III. Apresenta rigidez matinal, dificuldade para subir escadas e dor ao caminhar por mais de 15 minutos. Pele mais frágil e uso de anticoagulante leve.",
    patientComplaint: "Meus joelhos doem demais, principalmente de manhã quando levanto. Não consigo mais caminhar longas distâncias. Minha pele também está muito fina, qualquer coisa fica roxo.",
    options: [
      { label: "Massagem suave periarticular + mobilização leve", correct: true, explanation: "Correto! Em pacientes idosos com artrose, a massagem deve focar nos músculos periarticulares (quadríceps, isquiotibiais, panturrilhas) com pressão leve a moderada, evitando pressão direta sobre as articulações inflamadas. Use deslizamentos suaves e amassamento leve. A mobilização articular passiva suave melhora a amplitude de movimento. Cuidado com a fragilidade capilar: pressão excessiva causa equimoses, especialmente com uso de anticoagulante." },
      { label: "Fricção transversa profunda nos joelhos", correct: false, explanation: "Contraindicado. A fricção transversa profunda diretamente sobre articulações com artrose pode aumentar a inflamação e a dor. Além disso, o uso de anticoagulante aumenta o risco de hematomas. A abordagem deve ser na musculatura ao redor, nunca com pressão direta intensa sobre a articulação afetada." },
      { label: "Massagem Desportiva nas pernas", correct: false, explanation: "Inadequado. A intensidade da massagem desportiva não é apropriada para um paciente idoso com artrose e fragilidade capilar. As técnicas vigorosas podem causar hematomas extensos (especialmente com anticoagulante) e agravar a dor articular." },
      { label: "Crioterapia intensa nas articulações", correct: false, explanation: "Cuidado necessário. Embora o gelo possa ajudar na inflamação aguda, a aplicação intensa em idosos pode causar queimaduras por frio (pele mais sensível) e rigidez muscular. Se usar frio, deve ser por períodos curtos (10-15 min) com proteção tecidual. Não substitui a massagem como abordagem principal." },
    ],
  },
  {
    id: "sim-9",
    title: "Ciatalgia — Dor Ciática",
    description: "Paciente de 40 anos, motorista de caminhão. Relata dor que irradia do glúteo direito até a panturrilha, seguindo o trajeto do nervo ciático. RMN mostra protrusão discal L4-L5 sem compressão significativa. Médico liberou para massagem.",
    patientComplaint: "Sinto uma dor que começa no bumbum e desce pela perna direita até quase o pé. Piora quando fico muito tempo sentado. O médico disse que não preciso de cirurgia e me mandou fazer massagem.",
    options: [
      { label: "Massagem terapêutica no piriforme + glúteos + MI", correct: true, explanation: "Correto! A dor ciática frequentemente envolve contratura do músculo piriforme, que pode comprimir o nervo ciático. A massagem deve focar: (1) liberação do piriforme com digitopressão e deslizamento profundo, (2) amassamento dos glúteos médio e máximo, (3) técnicas de deslizamento ao longo do membro inferior seguindo o trajeto da dor. Evite pressão direta sobre a coluna lombar. Sempre respeite os limites de dor do paciente." },
      { label: "Massagem direta e profunda na coluna lombar", correct: false, explanation: "Incorreto e potencialmente perigoso. Com uma protrusão discal existente, pressão profunda direta sobre a coluna lombar pode agravar a protrusão e aumentar a compressão radicular. O tratamento deve focar na musculatura glútea e do membro inferior, aliviando a tensão que acompanha a ciatalgia sem manipular diretamente a região da lesão discal." },
      { label: "Alongamento forçado do membro afetado", correct: false, explanation: "Perigoso. Alongamentos forçados em um membro com irritação do nervo ciático podem aumentar a tração sobre o nervo, agravando os sintomas. Qualquer alongamento deve ser suave, gradual e interrompido imediatamente se provocar aumento da dor irradiada ou formigamento." },
      { label: "Massagem Modeladora na região lombar", correct: false, explanation: "Totalmente contraindicado. As técnicas vigorosas da modeladora sobre uma coluna com protrusão discal podem agravar significativamente o quadro, podendo transformar uma protrusão em herniação. Nunca aplique técnicas intensas sobre uma coluna com diagnóstico de alteração discal." },
    ],
  },
  {
    id: "sim-10",
    title: "Síndrome do Túnel do Carpo",
    description: "Paciente de 38 anos, designer gráfica, queixa-se de dor, formigamento e perda de força nas mãos, especialmente na mão direita. Diagnóstico médico de síndrome do túnel do carpo bilateral, grau leve. Usa tala noturna.",
    patientComplaint: "Minhas mãos formigam durante o trabalho e às vezes acordo com elas dormentes. Estou perdendo força para segurar coisas. Uso tala à noite mas queria algo que ajudasse mais.",
    options: [
      { label: "Massagem nos antebraços + punhos + liberação miofascial", correct: true, explanation: "Correto! A síndrome do túnel do carpo envolve compressão do nervo mediano no canal do carpo. A massagem deve focar nos músculos flexores do antebraço (que geram tensão no retináculo flexor), com técnicas de deslizamento profundo, amassamento e liberação miofascial. Trabalhe do cotovelo até o punho, aliviando a tensão dos tendões que passam pelo túnel. Evite pressão direta sobre o túnel do carpo (face anterior do punho). Complementar com alongamentos suaves dos flexores." },
      { label: "Massagem profunda diretamente no punho", correct: false, explanation: "Incorreto. Pressão profunda diretamente sobre o túnel do carpo (face anterior do punho) pode comprimir ainda mais o nervo mediano, agravando os sintomas de formigamento e dor. A abordagem correta é trabalhar os músculos do antebraço que tracionam os tendões através do túnel, aliviando a pressão indiretamente." },
      { label: "Massagem apenas nos ombros e pescoço", correct: false, explanation: "Insuficiente. Embora a tensão cervical possa contribuir para sintomas no membro superior (dupla compressão), tratar apenas ombros e pescoço não aborda a causa local no túnel do carpo. A abordagem deve incluir necessariamente o antebraço e a região do punho." },
      { label: "Aplicar calor intenso nas mãos", correct: false, explanation: "Inadequado como tratamento isolado. O calor pode aumentar o edema dentro do túnel do carpo, agravando a compressão do nervo mediano. Se usar calor, deve ser leve e no antebraço (não no punho) para relaxar a musculatura flexora, sempre como complemento à massagem." },
    ],
  },
  {
    id: "sim-11",
    title: "Atleta com Distensão Muscular",
    description: "Paciente de 25 anos, jogador de futebol. Sofreu distensão grau I no músculo adutor da coxa esquerda há 10 dias. Já passou da fase aguda. Fisioterapeuta liberou para massagem como complemento à reabilitação.",
    patientComplaint: "Sofri uma distensão na virilha jogando bola há 10 dias. O fisioterapeuta disse que posso fazer massagem agora para ajudar na recuperação. Preciso voltar a jogar em 2 semanas.",
    options: [
      { label: "Massagem de recuperação gradual no adutor + MIs", correct: true, explanation: "Correto! Após 10 dias de uma distensão grau I, o tecido está em fase de remodelamento. A massagem deve começar com deslizamentos leves ao redor da lesão (não diretamente sobre ela) e progredir gradualmente. Trabalhe os músculos compensadores (quadríceps, isquiotibiais, glúteos) que ficam sobrecarregados. Nas sessões seguintes, pode-se avançar para friction suave transversal para alinhar fibras cicatriciais. Sempre respeitar a dor como limite." },
      { label: "Massagem profunda e intensa diretamente na lesão", correct: false, explanation: "Contraindicado. Pressão intensa diretamente sobre uma distensão muscular recente (mesmo que já tenha passado a fase aguda) pode romper as fibras em cicatrização, causando nova lesão e atrasando significativamente a recuperação. A abordagem deve ser gradual e inicialmente periférica à lesão." },
      { label: "Ignorar a região e massagear só a outra perna", correct: false, explanation: "Insuficiente. Embora trabalhar o membro contralateral tenha algum benefício, o foco da recuperação deve incluir a região afetada (com técnicas adequadas). Massagear apenas a outra perna não promove a recuperação do tecido lesionado nem alivia as compensações musculares." },
      { label: "Crioterapia intensa por 30 minutos", correct: false, explanation: "Inadequado nesta fase. Após 10 dias, o processo inflamatório agudo já cessou e o tecido está em fase de remodelamento, que necessita de circulação sanguínea adequada. Crioterapia prolongada nesta fase pode retardar a cicatrização ao reduzir o fluxo sanguíneo necessário para a reparação tecidual." },
    ],
  },
  {
    id: "sim-12",
    title: "Paciente com Diabetes e Neuropatia",
    description: "Paciente de 60 anos com diabetes tipo 2 há 15 anos. Apresenta neuropatia periférica nos pés (sensibilidade reduzida), pele ressecada e fragilidade capilar. Glicemia relativamente controlada. Sem feridas nos pés.",
    patientComplaint: "Tenho diabetes há muitos anos e perdi sensibilidade nos pés. Quero melhorar a circulação e aliviar a tensão nas pernas, mas tenho medo de machucar sem sentir.",
    options: [
      { label: "Massagem suave nos MIs com hidratação + monitoramento", correct: true, explanation: "Correto! Em pacientes diabéticos com neuropatia periférica, a massagem deve ser: (1) Pressão leve a moderada — a sensibilidade reduzida impede que o paciente sinalize dor; (2) Monitorar a pele durante toda a sessão para sinais de vermelhidão excessiva ou lesão; (3) Hidratar bem a pele ressecada; (4) Evitar áreas com feridas, calosidades profundas ou sinais de infecção; (5) Deslizamentos suaves melhoram a circulação sem risco. Verificar glicemia antes da sessão — não realizar se < 70 mg/dL ou > 250 mg/dL." },
      { label: "Massagem profunda vigorosa nos pés", correct: false, explanation: "Perigoso. A neuropatia periférica reduz a sensibilidade, então o paciente não sentirá se a pressão estiver causando lesão tecidual. Pressão profunda pode causar hematomas, lesões de pele e até úlceras em pacientes diabéticos, que têm cicatrização comprometida. Qualquer ferida em paciente diabético pode evoluir para complicações graves." },
      { label: "Massagem com óleos essenciais concentrados", correct: false, explanation: "Risco elevado. Óleos essenciais concentrados podem irritar a pele já fragilizada do paciente diabético, causando reações alérgicas ou dermatite. A pele diabética tem barreira comprometida. Use apenas óleos carreadores neutros (como óleo de amêndoas) e em quantidade moderada." },
      { label: "Técnicas de percussão nos pés e pernas", correct: false, explanation: "Contraindicado. Técnicas de percussão (tapotement) em membros com neuropatia e fragilidade capilar podem causar hematomas e lesões. A fragilidade vascular do paciente diabético requer técnicas extremamente suaves e controladas." },
    ],
  },
  {
    id: "sim-13",
    title: "Bruxismo e Tensão na ATM",
    description: "Paciente de 34 anos, advogada, relata dor na articulação temporomandibular (ATM) bilateral, estalos ao abrir a boca, dificuldade para mastigar e dor que irradia para ouvidos e têmporas. Diagnóstico de disfunção da ATM. Usa placa miorrelaxante.",
    patientComplaint: "Acordo com a mandíbula travada e dor dos dois lados do rosto. Tenho estalos quando abro a boca e às vezes não consigo nem mastigar direito.",
    options: [
      { label: "Massagem nos músculos mastigatórios + cervical + craniana", correct: true, explanation: "Correto! O tratamento deve focar nos músculos pterigoideos (intra e extraoral se treinado), masseter, temporal e digástrico. A liberação da musculatura cervical é essencial pois a tensão no esternocleidomastoideo e suboccipitais frequentemente acompanha a disfunção da ATM. Digitopressão suave no masseter e deslizamentos no temporal reduzem significativamente a tensão. A massagem craniana complementa o relaxamento geral. Sessões 2x/semana por 4 semanas." },
      { label: "Massagem focada apenas no pescoço", correct: false, explanation: "Insuficiente. Embora a cervical esteja relacionada, ignorar os músculos mastigatórios diretamente responsáveis pela dor na ATM limita muito os resultados. O masseter e o temporal são os músculos mais tensos nesse quadro e precisam de atenção direta." },
      { label: "Massagem vigorosa na mandíbula", correct: false, explanation: "Perigoso. Técnicas vigorosas sobre a ATM podem deslocar o disco articular, agravar os estalos e aumentar a inflamação. A articulação temporomandibular é pequena e sensível — requer técnicas extremamente delicadas e precisas." },
      { label: "Drenagem linfática facial", correct: false, explanation: "Inadequado como tratamento principal. A drenagem linfática não alcança a profundidade necessária para liberar a tensão dos músculos mastigatórios. O problema é muscular e articular, não linfático. A drenagem poderia ser um complemento, mas não o tratamento primário." },
    ],
  },
  {
    id: "sim-14",
    title: "Escoliose e Desequilíbrio Muscular",
    description: "Paciente de 22 anos, estudante universitário, com escoliose funcional leve (curva torácica dextroconvexa). Apresenta dor dorsal assimétrica, ombro esquerdo mais elevado e assimetria visível na musculatura paravertebral. Fisioterapeuta recomendou massoterapia complementar.",
    patientComplaint: "Minhas costas doem mais de um lado e as pessoas sempre comentam que fico torto. O fisioterapeuta disse que massagem pode ajudar a equilibrar.",
    options: [
      { label: "Massagem assimétrica — relaxar lado côncavo e tonificar convexo", correct: true, explanation: "Correto! Na escoliose, os músculos do lado côncavo estão encurtados e hiper-tonificados, enquanto os do lado convexo estão alongados e enfraquecidos. O protocolo deve focar em relaxar e alongar a musculatura encurtada (massagem profunda, alongamento passivo) e estimular a musculatura alongada (técnicas de percussão leve, amassamento). Isso ajuda a equilibrar as forças musculares ao redor da coluna." },
      { label: "Massagem simétrica igual dos dois lados", correct: false, explanation: "Incorreto. Uma abordagem simétrica ignora o desequilíbrio muscular que caracteriza a escoliose. Os dois lados da coluna têm necessidades diferentes — um precisa ser relaxado e o outro estimulado. Tratar igualmente perpetua o desequilíbrio." },
      { label: "Manipulação vertebral para corrigir a curva", correct: false, explanation: "Fora do escopo do massoterapeuta. Manipulações vertebrais são atos privativos de fisioterapeutas e quiropratas com formação específica. A massoterapia atua na musculatura, não nas estruturas articulares da coluna. Além disso, manipulações em escoliose sem avaliação adequada podem causar lesões." },
      { label: "Massagem relaxante geral sem foco específico", correct: false, explanation: "Insuficiente. Embora o relaxamento geral seja benéfico, a escoliose requer uma abordagem direcionada e assimétrica. Uma massagem sem foco específico terá efeito temporário sem contribuir para a correção do desequilíbrio muscular que sustenta a curvatura." },
    ],
  },
  {
    id: "sim-15",
    title: "Fascite Plantar Crônica",
    description: "Paciente de 52 anos, vendedora ambulante, relata dor intensa na sola do pé direito, especialmente ao dar os primeiros passos pela manhã. Dor localizada na inserção do calcâneo. Diagnóstico de fascite plantar crônica há 6 meses. Já usou palmilha sem melhora completa.",
    patientComplaint: "Quando levanto de manhã, a dor na sola do pé é insuportável. Depois de andar um pouco melhora, mas no final do dia volta com tudo.",
    options: [
      { label: "Massagem da fáscia plantar + panturrilhas + mobilização do tornozelo", correct: true, explanation: "Correto! A fascite plantar está frequentemente associada ao encurtamento do tríceps sural (panturrilhas), que aumenta a tensão sobre a fáscia plantar. O protocolo ideal inclui: (1) liberação miofascial profunda na planta do pé, evitando pressão direta no ponto mais dolorido (inserção no calcâneo); (2) amassamento profundo e alongamento das panturrilhas; (3) mobilização do tornozelo para melhorar a dorsiflexão. Bolinha de gelo na sola ao final como analgésico/anti-inflamatório." },
      { label: "Massagem profunda apenas na sola do pé", correct: false, explanation: "Parcialmente correto mas incompleto. Trabalhar apenas a planta do pé ignora a cadeia posterior (panturrilhas e tendão de Aquiles) que é frequentemente a causa raiz da tensão excessiva na fáscia plantar. Além disso, pressão profunda diretamente sobre o ponto de inserção calcâneo pode agravar a inflamação." },
      { label: "Reflexologia completa como tratamento", correct: false, explanation: "Insuficiente. A reflexologia trabalha com pressão em pontos reflexos para efeitos sistêmicos, não para tratamento local de uma patologia específica como a fascite plantar. O paciente precisa de abordagem mecânica direta na fáscia e na cadeia muscular posterior." },
      { label: "Massagem nas costas para descomprimir a coluna", correct: false, explanation: "Sem relação direta com a queixa. Embora alterações posturais possam contribuir para problemas nos pés, o tratamento primário da fascite plantar deve focar na região afetada (planta do pé, panturrilhas e tornozelo). Trabalhar as costas não aliviará a inflamação da fáscia plantar." },
    ],
  },
  {
    id: "sim-16",
    title: "Paciente Oncológico em Tratamento",
    description: "Paciente de 55 anos, em tratamento de câncer de mama, concluiu quimioterapia há 3 semanas e está na fase de radioterapia. Apresenta fadiga extrema, náusea residual, linfedema leve no braço direito (lado da cirurgia) e ansiedade. Oncologista liberou para massagem adaptada.",
    patientComplaint: "Estou exausta do tratamento, com muita ansiedade e o braço do lado da cirurgia está inchado. Meu médico disse que massagem pode me ajudar, mas precisa ser especial.",
    options: [
      { label: "Massagem oncológica adaptada — pressão ultra-leve + drenagem linfática", correct: true, explanation: "Correto! A massagem oncológica é uma especialidade que requer formação específica. A pressão deve ser extremamente leve (toque terapêutico). Foco em: (1) relaxamento e redução da ansiedade; (2) drenagem linfática manual específica para linfedema pós-mastectomia (técnica de bandagem pode complementar); (3) evitar a região irradiada e áreas com tumor conhecido; (4) sessões curtas (20-30 min); (5) monitorar resposta constantemente. A massagem pode reduzir fadiga, náusea e ansiedade em pacientes oncológicos." },
      { label: "Massagem relaxante convencional com pressão normal", correct: false, explanation: "Perigoso. Pacientes em tratamento oncológico apresentam: plaquetas baixas (risco de hematomas), imunidade comprometida (risco de infecção), fragilidade capilar, pele sensibilizada pela radioterapia, e possível trombocitopenia. A pressão convencional pode causar lesões significativas. Toda massagem oncológica deve ser adaptada." },
      { label: "Massagem profunda para aliviar a fadiga", correct: false, explanation: "Contraindicado. A fadiga oncológica é de origem multifatorial (anemia, medicação, estresse emocional) e não responde a massagem profunda. A pressão intensa pode causar hematomas graves em pacientes com plaquetas baixas e agravar o linfedema. A abordagem deve ser extremamente suave." },
      { label: "Drenagem linfática bilateral vigorosa", correct: false, explanation: "Parcialmente inadequado. Embora a drenagem seja indicada para o linfedema, ela deve ser unilateral (apenas no membro afetado) e com protocolo específico pós-mastectomia, respeitando a remoção de linfonodos axilares. Drenagem vigorosa em paciente fragilizado pelo tratamento pode causar desconforto e complicações." },
    ],
  },
  {
    id: "sim-17",
    title: "Tendinite do Tendão de Aquiles",
    description: "Paciente de 42 anos, corredor amador, com dor no tendão de Aquiles direito há 3 semanas. Dor ao subir escadas e ao início da corrida (depois alivia). Espessamento palpável do tendão. Médico diagnosticou tendinopatia de Aquiles e recomendou massagem.",
    patientComplaint: "Meu tendão de Aquiles dói quando subo escadas e no início da corrida. Está mais grosso que o outro. Quero continuar correndo mas preciso melhorar.",
    options: [
      { label: "Fricção transversa no tendão + massagem nas panturrilhas + excêntricos", correct: true, explanation: "Correto! O protocolo para tendinopatia de Aquiles inclui: (1) Amassamento profundo dos gastrocnêmios e sóleo para reduzir a tensão sobre o tendão; (2) Fricção transversa profunda (Cyriax) diretamente no tendão — perpendicular às fibras, por 5-10 minutos — para estimular a reorganização do colágeno; (3) Orientação de exercícios excêntricos (protocolo de Alfredson), que são o tratamento com maior evidência para tendinopatias. A combinação dessas abordagens acelera significativamente a recuperação." },
      { label: "Massagem relaxante suave nos pés", correct: false, explanation: "Insuficiente. Uma abordagem suave nos pés não atinge o tendão de Aquiles nem a musculatura da panturrilha, que são as estruturas que necessitam de tratamento. A tendinopatia requer intervenção direta (fricção transversa) e trabalho na cadeia muscular associada." },
      { label: "Crioterapia contínua no tendão", correct: false, explanation: "Controvérso e insuficiente como tratamento isolado. Evidências recentes questionam o uso de crioterapia em tendinopatias crônicas (3+ semanas), pois a inflamação aguda já cedeu e o problema agora é degenerativo (tendinose). O tendão precisa de estímulo mecânico (fricção, exercícios) para remodelamento, não apenas analgesia." },
      { label: "Alongamento forçado do tendão de Aquiles", correct: false, explanation: "Perigoso. Alongamento forçado sobre um tendão com tendinopatia pode piorar as microlesões existentes e agravar a dor. O alongamento deve ser suave e progressivo, e os exercícios excêntricos (que combinam alongamento controlado com carga) são preferíveis ao alongamento estático forçado." },
    ],
  },
  {
    id: "sim-18",
    title: "Síndrome do Piriforme",
    description: "Paciente de 38 anos, entregador de moto, relata dor profunda no glúteo esquerdo que irradia pela face posterior da coxa. Dor piora ao sentar por mais de 20 minutos. RMN de coluna normal. Teste de FAIR (flexão, adução, rotação interna do quadril) positivo.",
    patientComplaint: "Tenho uma dor forte e funda no bumbum esquerdo que desce pela perna. Não consigo ficar sentado na moto por muito tempo. Já fiz exame da coluna e está tudo normal.",
    options: [
      { label: "Liberação do piriforme + glúteos + rotadores laterais do quadril", correct: true, explanation: "Correto! A síndrome do piriforme ocorre quando o músculo piriforme comprime o nervo ciático. O protocolo inclui: (1) Digitopressão profunda e sustentada no ventre do piriforme (localizado a 1/3 da distância entre o sacro e o trocânter maior); (2) Liberação dos rotadores laterais profundos (gêmeos, obturadores, quadrado femoral); (3) Amassamento do glúteo máximo e médio; (4) Alongamento passivo do piriforme (flexão do quadril com rotação interna). Oriente exercícios de alongamento para fazer diariamente e ajuste ergonômico na moto." },
      { label: "Massagem na coluna lombar com manipulação", correct: false, explanation: "Incorreto. A RMN de coluna está normal, indicando que a origem da dor não é espinhal. A síndrome do piriforme é uma causa extra-espinhal de ciatalgia. Massagear a lombar não tratará o piriforme, e manipulações vertebrais são fora do escopo do massoterapeuta." },
      { label: "Drenagem linfática no membro inferior", correct: false, explanation: "Inadequado. A dor do paciente é de origem muscular/neural (compressão do ciático pelo piriforme), não por acúmulo de líquidos. A drenagem linfática não alcança a profundidade muscular necessária e não aliviará a compressão do nervo." },
      { label: "Massagem modeladora no glúteo", correct: false, explanation: "Contraindicado. A massagem modeladora utiliza técnicas vigorosas voltadas para remodelação estética, não para tratamento de síndrome compressiva neural. Os movimentos rápidos e intensos podem agravar a irritação do nervo ciático e aumentar o espasmo do piriforme." },
    ],
  },
  {
    id: "sim-19",
    title: "Dor no Ombro com Bursite",
    description: "Paciente de 50 anos, dona de casa, relata dor no ombro direito há 6 semanas, que piora ao levantar o braço acima da cabeça (pentear cabelo, estender roupa). Dor noturna ao deitar sobre o lado afetado. Ultrassom revelou bursite subacromial sem ruptura do manguito rotador.",
    patientComplaint: "Meu ombro dói demais quando levanto o braço e à noite fico sem posição para dormir. O exame mostrou uma bursite.",
    options: [
      { label: "Massagem periarticular + manguito rotador + crioterapia local", correct: true, explanation: "Correto! Na bursite subacromial, evite pressão direta sobre o espaço subacromial (topo do ombro). O protocolo inclui: (1) Massagem descontraturante no trapézio, deltoide e musculatura periescapular; (2) Liberação suave dos músculos do manguito rotador (especialmente supraespinhoso e infraespinhoso) com técnicas miofasciais; (3) Mobilização passiva suave dentro da amplitude indolor; (4) Crioterapia na bolsa subacromial por 15 minutos ao final. Oriente exercícios pendulares de Codman para manutenção da mobilidade." },
      { label: "Massagem profunda diretamente no topo do ombro", correct: false, explanation: "Contraindicado. Pressão profunda diretamente sobre a bolsa subacromial inflamada agravará significativamente a dor e a inflamação. A bursite é um processo inflamatório da bolsa sinovial que fica entre o acrômio e o manguito rotador — pressão direta comprime ainda mais essa estrutura já irritada." },
      { label: "Alongamento forçado do ombro em todas as direções", correct: false, explanation: "Perigoso. Alongar forçosamente um ombro com bursite ativa pode comprimir ainda mais a bolsa inflamada, especialmente em abdução e rotação. Os movimentos devem ser gentis, dentro da amplitude indolor, e preferencialmente no formato de exercícios pendulares (utilizando a gravidade)." },
      { label: "Massagem apenas no pescoço ignorando o ombro", correct: false, explanation: "Insuficiente. Embora a cervical possa estar compensando, o foco do tratamento deve incluir a musculatura ao redor do ombro para descomprimir o espaço subacromial. Trabalhar apenas o pescoço não abordará a causa do problema." },
    ],
  },
  {
    id: "sim-20",
    title: "Ansiedade Severa com Hiperventilação",
    description: "Paciente de 26 anos, professora, procura atendimento em estado de ansiedade elevada. Relata episódio de hiperventilação há 30 minutos (mãos formigando, tontura, sensação de falta de ar). Agora estabilizada mas ainda muito tensa e com medo de nova crise.",
    patientComplaint: "Tive uma crise forte de ansiedade agora pouco, minhas mãos formigaram e senti que ia desmaiar. Estou com medo de acontecer de novo. Preciso relaxar mas não consigo.",
    options: [
      { label: "Acolhimento + respiração guiada + toque de ancoragem + relaxante suave", correct: true, explanation: "Correto! O paciente pós-crise de ansiedade precisa primeiro de acolhimento e estabilização emocional. O protocolo é: (1) Converse calmamente, valide os sentimentos; (2) Guie respiração diafragmática lenta (4-7-8) para reativar o parassimpático; (3) Inicie com toque de ancoragem — mãos paradas nos ombros por 30-60 segundos para criar sensação de segurança; (4) Massagem extremamente suave e lenta nas costas e ombros; (5) Acupressão nos pontos calmantes: PC6 (punho), Yintang (entre sobrancelhas), Anmian (atrás da orelha). Mantenha comunicação verbal constante e reasseguradora." },
      { label: "Massagem desportiva intensa para gastar energia", correct: false, explanation: "Totalmente contraindicado. Uma massagem vigorosa em alguém pós-crise de ansiedade pode ser interpretada pelo sistema nervoso como estímulo ameaçador, potencialmente desencadeando nova crise. O paciente precisa de estímulos calmantes, não excitantes." },
      { label: "Iniciar massagem imediatamente sem conversa prévia", correct: false, explanation: "Inadequado. O toque imediato sem preparação em um paciente pós-crise de ansiedade pode ser interpretado como invasivo e gerar mais tensão. A fase de acolhimento verbal e regulação respiratória é essencial antes de qualquer contato físico. O paciente precisa sentir-se seguro primeiro." },
      { label: "Recusar atendimento e mandar procurar psiquiatra", correct: false, explanation: "Parcialmente correto, parcialmente inadequado. Embora o encaminhamento para saúde mental seja importante a longo prazo, recusar atendimento neste momento abandona o paciente em estado vulnerável. O massoterapeuta pode e deve oferecer acolhimento, técnicas de relaxamento e massagem adaptada. O encaminhamento pode ser feito como orientação complementar, não como recusa de atendimento." },
    ],
  },
  {
    id: "sim-21",
    title: "Cervicalgia Aguda (Torcicolo)",
    description: "Paciente de 30 anos, designer, acordou com dor cervical intensa e limitação severa de movimento para o lado direito. Não consegue virar a cabeça. Sem histórico de trauma. Provavelmente dormiu em posição inadequada. Dor há 12 horas.",
    patientComplaint: "Acordei com o pescoço travado, não consigo virar a cabeça para a direita de jeito nenhum. A dor é muito forte e irradia para o ombro.",
    options: [
      { label: "Calor local + massagem suave progressiva + mobilização gentil", correct: true, explanation: "Correto! O torcicolo agudo é geralmente causado por espasmo protetor do esternocleidomastoideo e/ou trapézio superior. O protocolo inclui: (1) Compressa quente por 10-15 minutos para relaxar a musculatura; (2) Deslizamentos suaves na cervical e ombros, aumentando progressivamente a pressão conforme a tolerância; (3) Amassamento cuidadoso do trapézio superior; (4) Digitopressão suave nos pontos-gatilho; (5) Mobilização cervical extremamente gentil (micro-movimentos) para o lado restrito. Nunca force o movimento. O alívio pode ser significativo em uma sessão." },
      { label: "Rotação forçada da cabeça para destravar", correct: false, explanation: "Extremamente perigoso! Forçar o movimento em uma cervical com espasmo muscular protetor pode causar lesão muscular grave, lesão discal, ou pior, lesão da artéria vertebral. O espasmo existe para proteger — deve ser relaxado gradualmente, não forçado. Esta conduta pode ter consequências irreversíveis." },
      { label: "Massagem vigorosa imediata na cervical", correct: false, explanation: "Contraindicado na fase aguda. Técnicas vigorosas sobre músculos em espasmo protetor podem aumentar o espasmo (resposta de defesa), agravar a dor e causar microlesões adicionais na musculatura já comprometida. A abordagem deve ser inicialmente suave e progressiva." },
      { label: "Apenas orientar repouso e anti-inflamatório", correct: false, explanation: "Insuficiente como única abordagem. Embora o repouso relativo e medicação possam ajudar, a massoterapia bem aplicada pode acelerar significativamente a recuperação do torcicolo — muitas vezes em uma única sessão. O calor, a massagem suave e a mobilização gentil são mais eficazes que apenas esperar." },
    ],
  },
  {
    id: "sim-22",
    title: "Paciente com Depressão e Isolamento",
    description: "Paciente de 45 anos, recém-divorciado, diagnosticado com depressão moderada em tratamento com psiquiatra. Encaminhado para massoterapia como terapia complementar. Apresenta-se cabisbaixo, fala pouco, tensão generalizada e relata não ser tocado há meses.",
    patientComplaint: "O psiquiatra recomendou massagem. Estou tomando remédio mas ainda me sinto muito tenso e sozinho. Faz meses que ninguém encosta em mim.",
    options: [
      { label: "Massagem terapêutica com foco no toque acolhedor e escuta ativa", correct: true, explanation: "Correto! O toque terapêutico é extremamente poderoso para pacientes com depressão e isolamento social. O protocolo deve: (1) Criar ambiente acolhedor e seguro; (2) Comunicar-se com empatia, validar sentimentos sem tentar 'resolver'; (3) Massagem relaxante completa com pressão moderada — o toque firme (não leve demais) transmite segurança e presença; (4) Ritmo lento e constante; (5) A massagem estimula liberação de oxitocina (hormônio do vínculo), serotonina e dopamina, complementando o tratamento medicamentoso. Sessões regulares podem melhorar significativamente o humor e a qualidade de vida." },
      { label: "Massagem rápida e objetiva sem interação", correct: false, explanation: "Inadequado. Para um paciente depressivo e isolado, a dimensão relacional do atendimento é tão terapêutica quanto a técnica manual. Uma abordagem mecânica e distante pode reforçar a sensação de isolamento. O massoterapeuta não é psicólogo, mas o acolhimento empático durante a sessão é parte integral do tratamento." },
      { label: "Massagem desportiva intensa para liberar endorfinas", correct: false, explanation: "Desproporcional. Embora a liberação de endorfinas seja benéfica, a intensidade da massagem desportiva pode ser percebida como agressiva por um paciente emocionalmente vulnerável. A prioridade é conforto, segurança e relaxamento — não estimulação intensa." },
      { label: "Recusar o paciente por ser caso psiquiátrico", correct: false, explanation: "Incorreto e antiético. A massoterapia como terapia complementar para depressão tem forte evidência científica. O paciente está em acompanhamento psiquiátrico e foi encaminhado por seu médico. O massoterapeuta tem papel importante na melhora da qualidade de vida de pacientes com depressão." },
    ],
  },
];

export interface TreatmentPlan {
  id: string;
  title: string;
  emoji: string;
  description: string;
  duration: string;
  techniques: string[];
  observations: string[];
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
    id: "plan-lombar",
    title: "Dor Lombar",
    emoji: "🔥",
    description: "Protocolo completo para alívio de dor lombar de origem postural e muscular, com técnicas de descontração profunda e alongamento passivo.",
    duration: "50 minutos",
    techniques: ["Deslizamento profundo", "Amassamento", "Digitopressão", "Fricção circular", "Alongamento passivo"],
    observations: [
      "Sempre investigue a causa da dor antes de iniciar",
      "Evite pressão direta sobre processos espinhosos",
      "Se a dor irradiar para a perna, considere protocolo de ciática",
      "Recomende exercícios de fortalecimento do core para o pós-sessão"
    ],
    steps: [
      { order: 1, title: "Avaliação inicial", description: "Identifique a localização exata da dor, intensidade (0-10), tipo (pontada, queimação, peso) e fatores de piora. Palpação dos paravertebrais e quadrado lombar.", duration: "5 min" },
      { order: 2, title: "Aquecimento da região", description: "Deslizamentos superficiais longos por toda a extensão das costas, de caudal para cranial, para aquecer os tecidos e preparar a musculatura.", duration: "5 min" },
      { order: 3, title: "Deslizamento profundo nos paravertebrais", description: "Com polegares ou base da mão, deslize ao longo dos músculos paravertebrais lombares, da crista ilíaca até as costelas inferiores. Pressão moderada a profunda.", duration: "8 min" },
      { order: 4, title: "Amassamento do quadrado lombar", description: "Amassamento bilateral do quadrado lombar e massa muscular lombar. Use técnica de amassar com polegares alternados ou palma da mão.", duration: "8 min" },
      { order: 5, title: "Digitopressão nos trigger points", description: "Localize os pontos-gatilho nos paravertebrais e glúteo médio. Aplique pressão sustentada de 10-15 segundos em cada ponto até sentir o relaxamento tecidual.", duration: "8 min" },
      { order: 6, title: "Fricção circular nas inserções", description: "Fricções circulares profundas nas inserções musculares da crista ilíaca e na transição lombo-sacral.", duration: "5 min" },
      { order: 7, title: "Alongamento passivo", description: "Alongamento do iliopsoas (posição de Thomas), quadrado lombar (inclinação lateral) e isquiotibiais (elevação da perna reta). Manter cada posição por 20-30 segundos.", duration: "6 min" },
      { order: 8, title: "Finalização com deslizamento suave", description: "Deslizamentos longos e suaves para finalizar. Oriente sobre postura, pausas no trabalho e exercícios simples para casa.", duration: "5 min" },
    ],
    indications: ["Dor lombar postural", "Lombalgia muscular", "Tensão na região lombar", "Rigidez matinal na lombar", "Dor após esforço físico"],
    contraindications: ["Hérnia de disco aguda", "Fraturas vertebrais", "Infecção local", "Espondilolistese instável", "Tumor na região"],
  },
  {
    id: "plan-cervical",
    title: "Tensão Cervical",
    emoji: "🧊",
    description: "Protocolo para alívio de tensão e dor na região cervical, trapézio e base do crânio, muito comum em profissionais de escritório.",
    duration: "45 minutos",
    techniques: ["Deslizamento profundo", "Amassamento", "Digitopressura", "Compressão isquêmica", "Mobilização cervical suave"],
    observations: [
      "Nunca realize movimentos bruscos ou rotação forçada da cervical",
      "Cuidado com artéria vertebral — evite pressão lateral profunda",
      "Se houver formigamento nos braços, encaminhe para avaliação médica",
      "Ergonomia no trabalho é fundamental para prevenção"
    ],
    steps: [
      { order: 1, title: "Avaliação e anamnese", description: "Avalie amplitude de movimento cervical (flexão, extensão, rotação, inclinação), localização da dor e possíveis irradiações para braços.", duration: "5 min" },
      { order: 2, title: "Aquecimento do trapézio superior", description: "Deslizamentos amplos desde a inserção no occipital até o acrômio. Movimentos longos e fluidos para aquecer toda a região.", duration: "5 min" },
      { order: 3, title: "Amassamento do trapézio", description: "Amassamento firme do trapézio superior bilateral, usando técnica de pinçamento e amassamento com toda a mão. É a região que mais acumula tensão.", duration: "8 min" },
      { order: 4, title: "Digitopressão nos suboccipitais", description: "Com as pontas dos dedos, aplique pressão sustentada na musculatura suboccipital (base do crânio). Pressão gradual por 15-20 segundos em cada ponto.", duration: "5 min" },
      { order: 5, title: "Liberação do esternocleidomastoideo", description: "Com cuidado, trabalhe o ECM em pinçamento suave entre polegar e indicador, da mastóide até a clavícula. Técnica delicada.", duration: "5 min" },
      { order: 6, title: "Compressão isquêmica em trigger points", description: "Identifique e trate trigger points no trapézio médio, elevador da escápula e romboides. Pressão sustentada até liberação.", duration: "7 min" },
      { order: 7, title: "Mobilização cervical suave", description: "Rotações passivas suaves da cervical, inclinações laterais e flexo-extensão leve. Movimentos lentos e controlados.", duration: "5 min" },
      { order: 8, title: "Finalização e orientações", description: "Deslizamentos longos finais. Oriente sobre postura ao computador, altura da tela, pausas a cada 50 minutos e exercícios de mobilidade.", duration: "5 min" },
    ],
    indications: ["Tensão cervical", "Torcicolo", "Cefaleia tensional", "Dor nos ombros", "Rigidez cervical"],
    contraindications: ["Hérnia de disco cervical aguda", "Instabilidade cervical", "Vertigem posicional", "Artrite reumatoide ativa na cervical"],
  },
  {
    id: "plan-relaxante",
    title: "Relaxamento Completo",
    emoji: "🧘",
    description: "Protocolo completo de massagem relaxante para corpo inteiro, ideal para estresse, ansiedade e tensão generalizada. Foco na ativação do sistema nervoso parassimpático.",
    duration: "60 minutos",
    techniques: ["Effleurage", "Petrissage suave", "Deslizamento longo", "Toque suave craniano", "Movimentos rítmicos"],
    observations: [
      "Mantenha ritmo lento e constante durante toda a sessão",
      "O ambiente é tão importante quanto a técnica: música suave, aromaterapia, temperatura agradável",
      "Transições entre regiões devem ser fluidas, sem retirar totalmente as mãos",
      "Finalize sempre com toque suave e tempo para o paciente despertar"
    ],
    steps: [
      { order: 1, title: "Preparação do ambiente", description: "Ajuste temperatura (24-26°C), iluminação suave, música relaxante (60 BPM), aromaterapia (lavanda ou camomila). Aqueça as mãos e o óleo.", duration: "5 min" },
      { order: 2, title: "Anamnese rápida", description: "Pergunte sobre áreas de tensão, alergias, condições especiais. Explique o procedimento e defina expectativas.", duration: "5 min" },
      { order: 3, title: "Membros inferiores (posterior)", description: "Deslizamentos longos ascendentes nas panturrilhas e coxas. Amassamento suave dos gastrocnêmios e isquiotibiais. Ritmo lento e constante.", duration: "10 min" },
      { order: 4, title: "Costas e lombares", description: "Deslizamentos longos bilaterais por toda a extensão das costas. Amassamento suave dos paravertebrais. Movimentos em 'oito' no lombar. Pressão moderada e ritmo hipnótico.", duration: "15 min" },
      { order: 5, title: "Ombros e pescoço", description: "Amassamento suave do trapézio. Deslizamentos circulares nos deltoides. Digitopressão suave nos pontos de tensão. Massagem da base do crânio.", duration: "10 min" },
      { order: 6, title: "Membros superiores e mãos", description: "Deslizamentos nos braços. Amassamento suave nos antebraços. Massagem palmar com pressão circular nos polegares. Tração suave dos dedos.", duration: "5 min" },
      { order: 7, title: "Massagem facial e craniana", description: "Deslizamentos suaves no rosto (testa, zigomático, mandíbula). Massagem circular no couro cabeludo. Pressão suave nos pontos temporais.", duration: "5 min" },
      { order: 8, title: "Finalização consciente", description: "Movimentos de alisamento suaves diminuindo progressivamente. Permita 1-2 minutos de silêncio. Ofereça água. Oriente sobre manter o estado de relaxamento.", duration: "5 min" },
    ],
    indications: ["Estresse", "Ansiedade", "Insônia", "Tensão muscular generalizada", "Fadiga mental", "Necessidade de relaxamento"],
    contraindications: ["Febre", "Infecções de pele", "Trombose venosa profunda", "Fraturas recentes", "Pressão arterial descontrolada"],
  },
  {
    id: "plan-ansiedade",
    title: "Estresse e Ansiedade",
    emoji: "🌿",
    description: "Protocolo especializado para pacientes com alto nível de estresse e ansiedade, combinando técnicas de relaxamento profundo com pontos de acupressão calmantes.",
    duration: "50 minutos",
    techniques: ["Toque terapêutico", "Acupressão calmante", "Respiração guiada", "Effleurage lento", "Massagem craniana"],
    observations: [
      "Pacientes ansiosos podem ter reação inicial de desconforto ao toque — vá devagar",
      "Mantenha comunicação verbal suave e reasseguradora",
      "A respiração guiada no início é essencial para 'desligar' o modo simpático",
      "Evite silêncio total no início — use música ou sua voz para criar segurança"
    ],
    steps: [
      { order: 1, title: "Acolhimento e respiração", description: "Converse brevemente para criar confiança. Guie 5 ciclos respiratórios profundos (4s inspiração, 7s retenção, 8s expiração). Isso ativa o nervo vago e inicia o relaxamento.", duration: "5 min" },
      { order: 2, title: "Toque inicial nos pés", description: "Comece pelos pés — região segura e não-ameaçadora. Pressão firme e estável (evita cócegas). Pressione o ponto R1 (rim 1, centro do pé) por 30 segundos de cada lado.", duration: "5 min" },
      { order: 3, title: "Deslizamentos longos no dorso", description: "Deslizamentos lentos e rítmicos por toda a extensão das costas. Cada deslizamento deve durar 10-15 segundos. A lentidão é proposital — ativa o parassimpático.", duration: "10 min" },
      { order: 4, title: "Acupressão calmante nos ombros", description: "Pressão sustentada no ponto VB21 (topo dos ombros) por 30 segundos. Amassamento suave do trapézio. Ponto C7 (punho, lado ulnar) — calmante poderoso.", duration: "8 min" },
      { order: 5, title: "Massagem cervical suave", description: "Deslizamentos lentos na cervical. Digitopressura nos suboccipitais. Pressão no ponto VG20 (topo da cabeça) — ponto de calma e clareza mental.", duration: "7 min" },
      { order: 6, title: "Massagem craniana e facial", description: "Movimentos circulares lentos no couro cabeludo. Pressão suave nas têmporas. Deslizamento na testa de medial para lateral. Pressão no 'terceiro olho' (entre sobrancelhas).", duration: "8 min" },
      { order: 7, title: "Acupressão PC6 (náusea e ansiedade)", description: "Pressione o ponto PC6 (3 dedos acima do punho, face interna) por 1 minuto em cada lado. Este ponto é comprovadamente eficaz para ansiedade e náusea.", duration: "4 min" },
      { order: 8, title: "Finalização com toque de ancoragem", description: "Mantenha as mãos paradas nos ombros por 30 segundos (toque de ancoragem). Fale suavemente para retomar consciência. Ofereça chá de camomila se disponível.", duration: "3 min" },
    ],
    indications: ["Ansiedade", "Ataques de pânico leves", "Estresse crônico", "Insônia", "Agitação mental", "Tensão emocional"],
    contraindications: ["Transtorno psiquiátrico grave não tratado", "Crise de pânico ativa (estabilizar primeiro)", "Aversão ao toque (traumatismo)"],
  },
  {
    id: "plan-pernas",
    title: "Pernas Cansadas",
    emoji: "🦵",
    description: "Protocolo para alívio de pernas cansadas, pesadas e com edema leve, combinando drenagem linfática e massagem circulatória.",
    duration: "45 minutos",
    techniques: ["Drenagem linfática", "Deslizamento ascendente", "Bombeamento linfático", "Mobilização articular do tornozelo"],
    observations: [
      "Sempre verificar se não há sinais de trombose (dor unilateral, vermelhidão, calor localizado)",
      "Em caso de varizes, nunca aplique pressão direta sobre elas",
      "Elevar os membros inferiores em 30° potencializa o resultado",
      "Orientar sobre hidratação e elevação das pernas em casa"
    ],
    steps: [
      { order: 1, title: "Avaliação e posicionamento", description: "Avalie presença de edema, varizes e sinais de trombose. Posicione o paciente em decúbito dorsal com membros elevados a 30° (coloque almofada sob os joelhos).", duration: "5 min" },
      { order: 2, title: "Ativação de linfonodos inguinais", description: "Movimentos de bombeamento suave na região inguinal (virilha) para abrir a via linfática principal dos membros inferiores. 10-15 bombeamentos de cada lado.", duration: "5 min" },
      { order: 3, title: "Drenagem das coxas", description: "Deslizamentos ascendentes suaves e rítmicos nas coxas (anterior, medial e lateral). Pressão leve, velocidade lenta. Da face anterior do joelho até a virilha.", duration: "8 min" },
      { order: 4, title: "Ativação de linfonodos poplíteos", description: "Bombeamento suave atrás dos joelhos (fossa poplítea) para drenar a estação linfática intermediária. Movimentos delicados e rítmicos.", duration: "3 min" },
      { order: 5, title: "Drenagem das panturrilhas", description: "Deslizamentos ascendentes nas panturrilhas, do tornozelo até o joelho. Englobar toda a circunferência da perna. Pressão suave e constante.", duration: "8 min" },
      { order: 6, title: "Drenagem dos pés e tornozelos", description: "Movimentos de bombeamento ao redor dos maléolos. Deslizamentos na planta do pé de distal para proximal. Tração suave dos dedos.", duration: "6 min" },
      { order: 7, title: "Mobilização do tornozelo", description: "Flexão, extensão e rotação suave do tornozelo para melhorar o retorno venoso. Movimentos passivos, lentos e controlados.", duration: "5 min" },
      { order: 8, title: "Finalização e orientações", description: "Deslizamentos finais ascendentes em todo o membro. Mantenha as pernas elevadas por mais 2 minutos. Oriente sobre hidratação (2L/dia), elevação noturna e uso de meias de compressão.", duration: "5 min" },
    ],
    indications: ["Pernas cansadas e pesadas", "Edema leve de membros inferiores", "Retenção de líquidos", "Trabalho prolongado em pé", "Viagens longas"],
    contraindications: ["Trombose venosa profunda", "Varizes severas (grau IV-V)", "Erisipela", "Insuficiência cardíaca descompensada", "Infecção ativa"],
  },
  {
    id: "plan-drenagem",
    title: "Drenagem Linfática Básica",
    emoji: "💧",
    description: "Protocolo completo de drenagem linfática corporal para desintoxicação, redução de edema e melhora da circulação linfática geral.",
    duration: "55 minutos",
    techniques: ["Bombeamento linfático", "Movimentos circulares suaves", "Pressão de 30-40 mmHg", "Deslizamento rítmico"],
    observations: [
      "A pressão ideal é de apenas 30-40 mmHg — extremamente leve",
      "Sempre drene de proximal para distal (abra as 'portas' antes)",
      "Ritmo: 7-10 movimentos por minuto — lentidão é fundamental",
      "O paciente pode sentir vontade de urinar após a sessão — é normal e esperado"
    ],
    steps: [
      { order: 1, title: "Preparação e avaliação", description: "Verifique contraindicações. Posicione em decúbito dorsal. Ambiente calmo e temperatura agradável. Explique que a pressão será muito leve.", duration: "5 min" },
      { order: 2, title: "Ativação dos linfonodos cervicais", description: "Movimentos suaves e rítmicos na região cervical lateral (cadeia jugular) e supraclavicular. São as 'saídas finais' do sistema linfático. 15-20 bombeamentos.", duration: "5 min" },
      { order: 3, title: "Drenagem facial e cervical", description: "Movimentos suaves do centro da face para as laterais, descendo pelo pescoço até os linfonodos supraclaviculares.", duration: "5 min" },
      { order: 4, title: "Drenagem dos membros superiores", description: "Ativação axilar primeiro, depois drenar do punho para o cotovelo, do cotovelo para a axila. Movimentos de bombeamento suave.", duration: "8 min" },
      { order: 5, title: "Drenagem torácica", description: "Movimentos circulares suaves no tórax, das costelas laterais para o esterno, seguindo as vias linfáticas intercostais.", duration: "5 min" },
      { order: 6, title: "Drenagem abdominal", description: "Movimentos circulares no abdômen em sentido horário (seguindo o trânsito intestinal). Pressão extremamente leve. 20-30 movimentos completos.", duration: "7 min" },
      { order: 7, title: "Drenagem dos membros inferiores", description: "Ativação inguinal → coxas → joelhos (poplítea) → panturrilhas → pés. Sempre de proximal para distal. Deslizamentos ascendentes suaves.", duration: "12 min" },
      { order: 8, title: "Drenagem dorsal (decúbito ventral)", description: "Vire o paciente. Movimentos suaves das laterais do tronco para a coluna, da lombar para as axilas, seguindo as vias linfáticas do dorso.", duration: "5 min" },
      { order: 9, title: "Fechamento e hidratação", description: "Ativação final dos linfonodos cervicais e supraclaviculares. Oriente hidratação abundante (2-3L nas próximas 24h). Repouso por 10 minutos.", duration: "3 min" },
    ],
    indications: ["Retenção de líquidos", "Edema", "Pernas cansadas", "Celulite", "Pós-operatório (com liberação)", "Desintoxicação", "TPM com inchaço"],
    contraindications: ["Trombose venosa profunda", "Insuficiência cardíaca", "Infecções ativas", "Câncer sem liberação médica", "Insuficiência renal aguda"],
  },
  {
    id: "plan-costas",
    title: "Dor nas Costas",
    emoji: "🔧",
    description: "Protocolo abrangente para dor dorsal e escapular, comum em pessoas que carregam peso, dirigem ou trabalham em posições inadequadas.",
    duration: "45 minutos",
    techniques: ["Deslizamento profundo", "Amassamento", "Fricção transversa", "Digitopressura", "Liberação miofascial"],
    observations: [
      "Diferencie dor muscular de dor visceral referida (especialmente lado esquerdo)",
      "Dor entre as escápulas é frequentemente causada por postura anteriorizada dos ombros",
      "Trabalhe os peitorais (encurtados) além das costas para equilíbrio muscular",
      "Recomende exercícios de retração escapular para manutenção do resultado"
    ],
    steps: [
      { order: 1, title: "Avaliação postural", description: "Observe a postura do paciente em pé (anteriorização dos ombros, cifose torácica). Palpe a musculatura dorsal identificando pontos de maior tensão e trigger points.", duration: "5 min" },
      { order: 2, title: "Aquecimento geral das costas", description: "Deslizamentos longos bilaterais por toda a extensão das costas. Use base da mão e antebraço. Aqueça os tecidos por 3-4 passadas completas.", duration: "5 min" },
      { order: 3, title: "Amassamento dos paravertebrais torácicos", description: "Amassamento profundo da musculatura paravertebral torácica (eretores da espinha) desde T1 até T12. Use polegares alternados.", duration: "8 min" },
      { order: 4, title: "Liberação dos romboides e trapézio médio", description: "Deslizamento profundo e amassamento entre as escápulas. Fricção transversa nas inserções dos romboides na borda medial da escápula.", duration: "8 min" },
      { order: 5, title: "Digitopressura nos trigger points", description: "Pressão sustentada (15-20 segundos) nos trigger points identificados na avaliação. Principais: trapézio médio, infraespinhoso, romboides.", duration: "7 min" },
      { order: 6, title: "Liberação peitoral (complementar)", description: "Com o paciente em decúbito dorsal, deslizamento e digitopressura nos peitorais maior e menor. Esses músculos encurtados tracionam os ombros para frente, sobrecarregando as costas.", duration: "5 min" },
      { order: 7, title: "Mobilização escapular", description: "Mobilize passivamente as escápulas: elevação, depressão, retração e protração. Isso libera aderências e melhora a mobilidade da cintura escapular.", duration: "4 min" },
      { order: 8, title: "Finalização e orientações", description: "Deslizamentos finais suaves. Oriente sobre fortalecimento dos romboides e trapézio médio-inferior, e alongamento dos peitorais.", duration: "3 min" },
    ],
    indications: ["Dor dorsal", "Dor entre as escápulas", "Dorsalgia postural", "Tensão muscular nas costas", "Cifose funcional"],
    contraindications: ["Fraturas vertebrais", "Osteoporose severa", "Hérnia de disco torácica aguda", "Dor torácica de origem cardíaca"],
  },
  {
    id: "plan-rigidez",
    title: "Rigidez Muscular",
    emoji: "⚡",
    description: "Protocolo para tratamento de rigidez muscular generalizada ou localizada, com foco em liberação de trigger points e restauração da amplitude de movimento.",
    duration: "50 minutos",
    techniques: ["Liberação miofascial", "Compressão isquêmica", "Alongamento passivo", "Amassamento profundo", "Mobilização articular"],
    observations: [
      "Rigidez pode ser protetiva — não force além da tolerância do paciente",
      "Diferencie rigidez muscular de rigidez articular (artrose, artrite)",
      "Hidratação inadequada é causa comum de rigidez — oriente sobre água",
      "Sessões frequentes são mais eficazes que sessões isoladas intensas"
    ],
    steps: [
      { order: 1, title: "Avaliação da rigidez", description: "Teste amplitude de movimento das articulações envolvidas. Identifique quais músculos estão encurtados/rígidos. Escala de rigidez do paciente (0-10).", duration: "5 min" },
      { order: 2, title: "Aquecimento tecidual", description: "Deslizamentos progressivos de superficial a profundo na região afetada. Pode usar compressa quente prévia por 5 minutos para aumentar a elasticidade tecidual.", duration: "5 min" },
      { order: 3, title: "Liberação miofascial", description: "Deslizamento lento e sustentado com a palma ou antebraço, mantendo pressão por 60-90 segundos em cada região até sentir a fáscia 'ceder'. Não force — espere o tecido relaxar.", duration: "10 min" },
      { order: 4, title: "Compressão isquêmica em trigger points", description: "Pressão gradual e sustentada nos trigger points (15-30 segundos) até a dor referida diminuir. Isso causa isquemia local seguida de hiperemia reativa, relaxando o nódulo.", duration: "8 min" },
      { order: 5, title: "Amassamento profundo", description: "Amassamento firme da musculatura rígida para aumentar circulação, temperatura local e flexibilidade tecidual. Alterne entre polegares, nós dos dedos e base da mão.", duration: "8 min" },
      { order: 6, title: "Alongamento passivo da região", description: "Alongamentos lentos e sustentados (30 segundos cada) dos músculos trabalhados. Leve até o ponto de tensão, nunca de dor. Repita 2-3 vezes cada posição.", duration: "7 min" },
      { order: 7, title: "Mobilização articular", description: "Movimentos passivos suaves das articulações envolvidas por toda a amplitude disponível. Oscilações rítmicas grau II (Maitland) para ganho de mobilidade.", duration: "5 min" },
      { order: 8, title: "Finalização", description: "Deslizamentos finais suaves. Recomende: hidratação aumentada, banho morno, alongamentos diários e evitar posições prolongadas.", duration: "2 min" },
    ],
    indications: ["Rigidez muscular generalizada", "Contratura muscular", "Redução de amplitude de movimento", "Tensão crônica", "Sedentarismo"],
    contraindications: ["Rigidez de origem neurológica (Parkinson — requer protocolo específico)", "Artrite em fase aguda", "Miosite", "Espasticidade"],
  },
  {
    id: "plan-ombros",
    title: "Ombros Tensos",
    emoji: "💆",
    description: "Protocolo focado na síndrome do ombro tenso, incluindo trapézio, deltoides, manguito rotador e musculatura periescapular.",
    duration: "45 minutos",
    techniques: ["Amassamento profundo", "Fricção transversa", "Digitopressura", "Mobilização glenoumeral", "Liberação miofascial"],
    observations: [
      "O ombro é uma articulação complexa — 17 músculos contribuem para seu movimento",
      "Não confunda tensão muscular com lesão do manguito rotador (teste com movimentos resistidos)",
      "Trabalhe também cervical e peitorais — são cadeias musculares conectadas",
      "Ansiedade e estresse são as principais causas de tensão nos ombros"
    ],
    steps: [
      { order: 1, title: "Avaliação funcional", description: "Teste amplitude de movimento ativo e passivo do ombro. Testes especiais: Neer (impacto), Jobe (supraespinhoso). Palpação do trapézio, deltóides e infraespinhoso.", duration: "5 min" },
      { order: 2, title: "Aquecimento cervical e ombros", description: "Deslizamentos amplos cobrindo cervical, trapézio, deltoides e região escapular. Preparação dos tecidos para trabalho mais profundo.", duration: "5 min" },
      { order: 3, title: "Amassamento profundo do trapézio", description: "Técnica de pinçamento e amassamento do trapézio superior bilateral. É o músculo mais afetado pela postura e estresse. Trabalhe de medial para lateral.", duration: "8 min" },
      { order: 4, title: "Liberação do elevador da escápula", description: "Deslizamento profundo e digitopressura no elevador da escápula (do ângulo superior da escápula até os processos transversos cervicais). Principal causa de 'nó' no ombro.", duration: "5 min" },
      { order: 5, title: "Trabalho no manguito rotador", description: "Fricção transversa e deslizamento no supraespinhoso, infraespinhoso e redondo menor. Acesse a fossa infraespinhosa com polegares. Pressão moderada.", duration: "7 min" },
      { order: 6, title: "Liberação peitoral menor e deltoide anterior", description: "Com o paciente em decúbito dorsal, trabalhe o peitoral menor (abaixo da clavícula) e deltóide anterior. Esses músculos encurtados anteriorizam o ombro.", duration: "5 min" },
      { order: 7, title: "Mobilização glenoumeral", description: "Mobilize passivamente o ombro: flexão, abdução, rotação interna e externa. Tração leve (grau I) para descompressão articular. Movimentos suaves e controlados.", duration: "5 min" },
      { order: 8, title: "Finalização e recomendações", description: "Deslizamentos finais longos. Recomende: fortalecimento dos estabilizadores escapulares, alongamento dos peitorais, pausas no trabalho e gerenciamento de estresse.", duration: "5 min" },
    ],
    indications: ["Tensão nos ombros", "Dor na região escapular", "Elevação involuntária dos ombros", "Estresse com somatização nos ombros", "Bursite leve"],
    contraindications: ["Ruptura do manguito rotador (aguda)", "Luxação recente", "Capsulite adesiva em fase inflamatória", "Fraturas na região"],
  },
  {
    id: "plan-postreino",
    title: "Pós-Treino",
    emoji: "🏋️",
    description: "Protocolo de recuperação muscular pós-treino para atletas e praticantes de atividade física, focado em reduzir DOMS e acelerar a recuperação.",
    duration: "45 minutos",
    techniques: ["Massagem desportiva", "Deslizamento profundo", "Compressão rítmica", "Petrissage", "Alongamento assistido"],
    observations: [
      "Ideal realizar entre 2h e 48h após o treino",
      "Pressão moderada — tecido já está inflamado pelo exercício",
      "Hidratação pós-sessão é fundamental para eliminação de metabólitos",
      "Se houver dor aguda localizada (não difusa), investigar possível lesão"
    ],
    steps: [
      { order: 1, title: "Anamnese do treino", description: "Pergunte: que grupos foram treinados, intensidade, há quanto tempo, nível de dor (0-10), lesões prévias. Isso direciona o foco do tratamento.", duration: "3 min" },
      { order: 2, title: "Deslizamento geral de aquecimento", description: "Deslizamentos superficiais a moderados nos grupos musculares treinados. Isso aumenta o fluxo sanguíneo e prepara o tecido sem agravar a inflamação.", duration: "5 min" },
      { order: 3, title: "Compressão rítmica nos grandes grupos", description: "Compressões amplas e rítmicas (como bombear) nos quadríceps, isquiotibiais, glúteos ou dorsais conforme o treino. Melhora o fluxo sanguíneo profundo.", duration: "8 min" },
      { order: 4, title: "Petrissage (amassamento) moderado", description: "Amassamento dos grupos musculares treinados com pressão moderada (não intensa). Auxilia na remoção de metabólitos e redução do edema intramuscular.", duration: "10 min" },
      { order: 5, title: "Deslizamento profundo ao longo das fibras", description: "Deslizamento firme seguindo a direção das fibras musculares. Isso alinha fibras, melhora circulação e reduz aderências que se formam durante a inflamação.", duration: "7 min" },
      { order: 6, title: "Alongamento assistido (PNF)", description: "Técnica de facilitação neuromuscular proprioceptiva: o paciente contrai o músculo por 6 segundos contra sua resistência, relaxa, e você alonga 30 segundos. 2-3 repetições por grupo.", duration: "7 min" },
      { order: 7, title: "Crioterapia localizada (opcional)", description: "Se houver edema visível ou dor significativa, aplique gelo por 10-15 minutos na região mais afetada. Proteja a pele com tecido fino.", duration: "3 min" },
      { order: 8, title: "Finalização e orientações", description: "Deslizamentos finais suaves. Oriente: beba 500ml de água agora, banho morno (não quente), alimentação proteica, sono de qualidade e descanso ativo no dia seguinte.", duration: "2 min" },
    ],
    indications: ["DOMS (dor muscular tardia)", "Recuperação pós-treino intenso", "Fadiga muscular", "Rigidez pós-exercício", "Preparação para competição"],
    contraindications: ["Lesão muscular aguda (distensão/ruptura)", "Rabdomiólise", "Fraturas por estresse", "Síndrome compartimental"],
  },
];
