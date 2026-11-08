// Banco transcrito do DOCX fornecido pelo grupo. Revisão pedagógica ainda pendente.
export const BANK_VERSION = '2026-11';
export type Question = {
 id: string; number: number; title: string; scenario: string; question: string;
 options: string[]; correct: number; explanation: string; feedback: (string | null)[];
 connection: string; reference: string; source: string; reviewStatus: string;
 reviewNote: string; emphasizeNegation: boolean;
};
export type Phase = { title: string; topic: string; description: string; tag: string; intro: string; questions: Question[] };
export const phases: Phase[] = [
  {
    "title": "Execução dos trabalhos",
    "topic": "4.4",
    "description": "Da primeira evidência à conclusão: faça cada detalhe contar.",
    "tag": "O COMEÇO DE TUDO",
    "intro": "Você acabou de entrar na firma e foi escalado para o trabalho de uma indústria recém-contratada.",
    "questions": [
      {
        "id": "2026-11-p1",
        "number": 1,
        "title": "Sistema que ninguém domina",
        "scenario": "a indústria usa um ERP integrado e complexo, e ninguém da equipe tem experiência com auditoria de sistemas.",
        "question": "O que a firma deve fazer antes de começar?",
        "options": [
          "Seguir o planejamento padrão e testar só os documentos impressos, já que o ERP é responsabilidade da TI do cliente.",
          "Pedir ao gerente de TI do cliente um relatório atestando que o sistema é confiável e usá-lo como evidência.",
          "Avaliar a necessidade de alocar um profissional especializado em tecnologia antes de iniciar os trabalhos.",
          "Rescindir o contrato, pois a firma só pode atender clientes cujos sistemas a equipe já domine."
        ],
        "correct": 2,
        "explanation": "o auditor precisa ter consciência da sua capacidade técnica e verificar se precisa de especialistas em TI, em matéria fiscal ou no ramo do cliente.",
        "feedback": [
          "Deixa de fora uma parte relevante do trabalho.",
          "Usa um documento da própria auditada sem avaliação independente.",
          null,
          "A norma pede avaliar os recursos necessários, não recusar automaticamente o cliente."
        ],
        "connection": "com o especialista definido, a equipe está montada. Agora é preciso distribuir as tarefas sem perder qualidade.",
        "reference": "NBC T 11.8, item 11.8.3.3",
        "source": "exemplo do rascunho, com novas alternativas erradas",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p2",
        "number": 2,
        "title": "Delegando a contagem de estoque",
        "scenario": "o sênior da equipe delegou a contagem de estoque a um assistente recém-contratado.",
        "question": "O que a norma exige sobre essa delegação?",
        "options": [
          "Que a delegação assegure o padrão de qualidade, com supervisão para avaliar se a tarefa foi cumprida com a competência exigida.",
          "Que tarefas só sejam delegadas a profissionais com pelo menos cinco anos de experiência em auditoria.",
          "Que, depois de delegada, a responsabilidade pela contagem passe a ser do assistente que a executou.",
          "Que o assistente assine sozinho os papéis de trabalho da contagem, sem necessidade de revisão."
        ],
        "correct": 0,
        "explanation": "delegar é permitido em todos os níveis da equipe, desde que assegure o padrão de qualidade. Quem supervisiona avalia se a tarefa foi cumprida com a competência exigida.",
        "feedback": [
          null,
          "A norma não estabelece cinco anos de experiência para receber uma tarefa.",
          "Delegar não transfere a responsabilidade de quem supervisiona.",
          "A delegação não dispensa a revisão de quem supervisiona."
        ],
        "connection": "o que foi delegado e por quem precisa ficar registrado. Esse é o tema da próxima pergunta.",
        "reference": "NBC T 11.8, itens 11.8.3.6 e 11.8.1.8 (b)",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p3",
        "number": 3,
        "title": "\"Documentar toma tempo\"",
        "scenario": "na fase de aceitação do cliente, o gerente pede para não registrar as informações e os julgamentos que levaram ao planejamento preliminar, porque \"isso toma tempo\".",
        "question": "Qual a postura correta?",
        "options": [
          "Concordar, desde que o relatório final seja bem fundamentado.",
          "Registrar apenas se o cliente for uma companhia de capital aberto.",
          "Registrar só os números e deixar os julgamentos com a equipe, que conhece o cliente.",
          "Documentar o trabalho e as informações da aceitação, incluindo o planejamento preliminar e as atribuições de cada profissional."
        ],
        "correct": 3,
        "explanation": "a firma deve ter política de documentar os trabalhos e as informações obtidas na aceitação ou retenção do cliente, incluindo o planejamento preliminar e as atribuições de cada profissional.",
        "feedback": [
          "A documentação é a evidência que sustenta o relatório.",
          "A exigência não se limita às companhias de capital aberto.",
          "Os julgamentos também precisam ser documentados.",
          null
        ],
        "connection": "a documentação mostra quem fez cada parte. Isso leva à próxima decisão: a equipe tem a experiência certa?",
        "reference": "NBC T 11.8, item 11.8.3.1",
        "source": "adaptada de Unifil, Prefeitura de Leópolis (PR), 2021, Q2211967, alternativa C",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p4",
        "number": 4,
        "title": "Trainees num banco",
        "scenario": "a firma vai auditar um banco de médio porte pela primeira vez. O sócio sugere montar a equipe só com trainees, porque são os que estão disponíveis.",
        "question": "O que deve ser feito?",
        "options": [
          "Aceitar, porque a revisão do sócio no encerramento compensa a falta de experiência.",
          "Montar uma equipe com experiência compatível com a complexidade e o risco do serviço, com treinamento e especialização adequados.",
          "Aceitar, desde que os trainees façam um curso rápido sobre bancos durante o trabalho.",
          "Montar a equipe só com sócios, porque bancos exigem que todo o trabalho seja feito por responsáveis técnicos."
        ],
        "correct": 1,
        "explanation": "a equipe deve ter experiência compatível com a complexidade e o risco do serviço. A firma deve designar pessoas com treinamento, experiência e especialização adequados.",
        "feedback": [
          "A revisão no encerramento não substitui a experiência adequada da equipe.",
          null,
          "A capacitação precisa ser adequada ao trabalho; um curso durante a execução não basta.",
          "A norma pede experiência compatível, não uma equipe formada apenas por sócios."
        ],
        "connection": "mesmo uma equipe experiente precisa de acompanhamento do início ao fim. É o que a última pergunta da fase testa.",
        "reference": "NBC T 11.8, itens 11.8.3.2 e 11.8.3.5",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p5",
        "number": 5,
        "title": "Revisão só no começo",
        "scenario": "faltando dois dias para entregar o relatório, o gerente diz que não precisa revisar os papéis de trabalho da execução, porque o planejamento já foi revisado no início.",
        "question": "Ele está certo?",
        "options": [
          "Sim. A norma só exige revisão formal na etapa de planejamento.",
          "Sim, desde que o cliente não tenha apontado nenhum problema.",
          "Não, mas só se houver algum ajuste contábil relevante a ser proposto.",
          "Não. O trabalho deve ser planejado, supervisionado e revisado em todas as etapas, incluindo ver se as conclusões vêm do que foi executado."
        ],
        "correct": 3,
        "explanation": "o auditor deve planejar, supervisionar e revisar o trabalho em todas as etapas. Antes de opinar, ele confere se o trabalho foi documentado e se as conclusões vêm do que foi feito.",
        "feedback": [
          "A revisão é exigida em todas as etapas, não apenas no planejamento.",
          "A ausência de reclamação do cliente não é critério para dispensar a revisão.",
          "A revisão não depende de haver um ajuste contábil relevante.",
          null
        ],
        "connection": "o trabalho foi bem executado, mas a firma só chegou a ele porque aceitou esse cliente. Como se decide quem aceitar? É a Fase 2.",
        "reference": "NBC T 11.8, itens 11.8.3.4 e 11.8.1.8 (d) e (e)",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      }
    ]
  },
  {
    "title": "Avaliação da carteira de clientes",
    "topic": "4.5",
    "description": "Conheça quem está do outro lado dos números.",
    "tag": "OLHAR INVESTIGATIVO",
    "intro": "Agora você ajuda o sócio a decidir quais clientes a firma aceita e mantém.",
    "questions": [
      {
        "id": "2026-11-p6",
        "number": 6,
        "title": "Cliente de maior risco",
        "scenario": "uma empresa com histórico de autuações fiscais e mudança recente de controle quer contratar a firma, e o sócio a classificou como cliente de maior risco.",
        "question": "O que a firma deve fazer?",
        "options": [
          "Indicar mais de um responsável técnico na aceitação, na revisão do planejamento, na discussão dos assuntos críticos e no encerramento.",
          "Indicar um único responsável técnico, o mais experiente, para centralizar as decisões e evitar opiniões conflitantes.",
          "Aceitar e cobrar honorários mais altos para compensar o risco maior.",
          "Aceitar, desde que o contrato transfira ao cliente a responsabilidade por erros na opinião."
        ],
        "correct": 0,
        "explanation": "clientes de maior risco exigem mais de um responsável técnico nas etapas críticas, principalmente no relatório. Se a firma tem um só profissional, é obrigatório chamar outro profissional habilitado.",
        "feedback": [
          null,
          "A norma pede mais de um responsável técnico nas etapas críticas.",
          "Cobrar mais não reduz o risco do trabalho.",
          "A responsabilidade pela opinião continua sendo do auditor."
        ],
        "connection": "para classificar o risco, é preciso conhecer quem está por trás da empresa. Isso aparece na próxima pergunta.",
        "reference": "NBC T 11.8, item 11.8.4.1",
        "source": "exemplo do rascunho, com novas alternativas erradas",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p7",
        "number": 7,
        "title": "O sócio que também é fornecedor",
        "scenario": "na análise de aceitação, você descobre que um dos sócios do possível cliente é dono do principal fornecedor, e as compras são feitas sem cotação.",
        "question": "Como isso entra na avaliação?",
        "options": [
          "Não entra. Operações entre empresas são decisão da administração e não afetam a aceitação.",
          "Entra. A existência e a política de transações com partes relacionadas fazem parte da avaliação de um novo cliente.",
          "Leva à recusa automática, porque transações com partes relacionadas são proibidas.",
          "Só deve ser analisado depois da contratação, durante o planejamento."
        ],
        "correct": 1,
        "explanation": "a avaliação de um novo cliente inclui a identificação e a reputação de sócios e administradores e a política de transações com partes relacionadas.",
        "feedback": [
          "A política de transações com partes relacionadas integra a avaliação de aceitação.",
          null,
          "Transações com partes relacionadas não são proibidas por si só; devem ser avaliadas.",
          "A análise precisa contribuir para a decisão de aceitar o cliente."
        ],
        "connection": "outra pista sobre o cliente é o histórico com auditores anteriores. É a próxima situação.",
        "reference": "NBC T 11.8, item 11.8.4.8 (a) e (f)",
        "source": "adaptada de Estude Grátis, Q68508 (banca e ano não informados)",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p8",
        "number": 8,
        "title": "Três auditores em quatro anos",
        "scenario": "o possível cliente trocou de auditor três vezes em quatro anos.",
        "question": "Qual procedimento a firma deve adotar?",
        "options": [
          "Não tocar no assunto, para não criar constrangimento com o cliente.",
          "Exigir os papéis de trabalho dos auditores anteriores como condição para aceitar.",
          "Verificar o motivo das trocas e perguntar ao auditor anterior se houve razão de ordem profissional para a mudança.",
          "Aceitar, porque trocas frequentes mostram que o cliente busca um serviço melhor."
        ],
        "correct": 2,
        "explanation": "a firma deve verificar se houve troca constante de auditores e perguntar ao auditor anterior se houve razão profissional para a mudança.",
        "feedback": [
          "Trocas frequentes são um alerta que precisa ser investigado.",
          "O item citado não exige os papéis anteriores como condição de aceitação.",
          null,
          "Trocas frequentes são um sinal de risco, não uma garantia de qualidade."
        ],
        "connection": "além do histórico, a firma precisa saber se o cliente vai continuar operando. É o tema da próxima pergunta.",
        "reference": "NBC T 11.8, item 11.8.4.8 (i) e (j)",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p9",
        "number": 9,
        "title": "Capital de giro negativo",
        "scenario": "ao analisar o possível cliente, você nota capital circulante líquido negativo há dois anos e empréstimos vencidos.",
        "question": "Como isso pesa na aceitação?",
        "options": [
          "Não pesa. A situação financeira só importa na hora de emitir o relatório.",
          "Obriga a firma a recusar o cliente, sem precisar de outra análise.",
          "É assunto do financeiro do cliente, não da firma de auditoria.",
          "Pesa. Conhecer a situação financeira e a probabilidade de continuidade operacional faz parte da avaliação, e riscos manifestos devem ser evitados."
        ],
        "correct": 3,
        "explanation": "a firma deve conhecer a situação financeira do cliente, incluindo a probabilidade de continuidade operacional, e evitar contratações com riscos manifestos.",
        "feedback": [
          "A situação financeira deve ser considerada antes da aceitação.",
          "O indicador exige avaliação, não recusa automática.",
          "O risco do cliente também afeta a firma de auditoria.",
          null
        ],
        "connection": "cada análise feita até aqui vale também para os clientes que a firma já tem. É o que fecha a fase.",
        "reference": "NBC T 11.8, item 11.8.4.9",
        "source": "adaptada de Estude Grátis, Q68517 (banca e ano não informados)",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p10",
        "number": 10,
        "title": "Agenda cheia, cliente novo",
        "scenario": "em novembro, todas as horas da equipe já estão comprometidas, e um cliente grande pede proposta.",
        "question": "Na avaliação permanente da carteira, o que a firma deve considerar?",
        "options": [
          "A capacidade de atendimento (horas disponíveis da equipe frente às horas contratadas), a independência e a integridade dos administradores, com a avaliação feita por escrito.",
          "Apenas o valor dos honorários, que define a prioridade entre os clientes.",
          "Aceitar e liberar horas reduzindo os testes nos clientes antigos.",
          "Nada por enquanto. A carteira só precisa ser avaliada quando o CFC pedir."
        ],
        "correct": 0,
        "explanation": "a avaliação permanente da carteira é feita por escrito. Ela considera a capacidade de atendimento, a independência de toda a equipe, a integridade dos administradores e a necessidade de rodízio.",
        "feedback": [
          null,
          "O valor dos honorários não substitui a avaliação da capacidade, independência e integridade.",
          "Reduzir testes necessários prejudica a qualidade dos trabalhos atuais.",
          "A avaliação da carteira é permanente e não depende de uma solicitação do CFC."
        ],
        "connection": "a avaliação da carteira faz parte do controle de qualidade da firma, que é o tema da Fase 3.",
        "reference": "NBC T 11.8, itens 11.8.1.12 e 11.8.1.13",
        "source": "adaptada de Estude Grátis, Q68515 e Q68506",
        "reviewStatus": "pending",
        "reviewNote": "a revisar, conferir no livro se o Crepaldi coloca esse trecho no 4.5 ou no 4.6",
        "emphasizeNegation": false
      }
    ]
  },
  {
    "title": "Controle de qualidade interno",
    "topic": "4.6",
    "description": "Um bom trabalho também precisa de um segundo olhar.",
    "tag": "EXCELÊNCIA NA PRÁTICA",
    "intro": "O ano acabou e você foi chamado para o comitê que revisa a qualidade da própria firma.",
    "questions": [
      {
        "id": "2026-11-p11",
        "number": 11,
        "title": "De quanto em quanto tempo?",
        "scenario": "o comitê vai montar o calendário do programa de verificação periódica da qualidade.",
        "question": "Com que frequência ele deve ser aplicado?",
        "options": [
          "No mínimo a cada quatro anos, como em um ciclo de revisão externa.",
          "Anualmente, com seleção de uma amostra dos serviços prestados a clientes.",
          "Somente quando um cliente reclamar ou o CRC abrir um processo.",
          "Uma vez, ao implantar o sistema de qualidade, e de novo só quando as normas mudarem."
        ],
        "correct": 1,
        "explanation": "o programa deve ser aplicado anualmente, com uma amostra dos serviços prestados, para verificar se as normas foram cumpridas.",
        "feedback": [
          "A periodicidade de quatro anos pertence à norma de 2001; o material adota a de 2005.",
          null,
          "O controle deve ser periódico, não depender de uma reclamação ou processo.",
          "O controle não se limita à implantação nem a mudanças nas normas."
        ],
        "connection": "com a amostra escolhida, falta saber o que verificar em cada trabalho. É a próxima pergunta.",
        "reference": "NBC T 11.8, item 11.8.5.2",
        "source": "exemplo do rascunho, com novas alternativas erradas",
        "reviewStatus": "pending",
        "reviewNote": "a revisar, conferir no livro se a alternativa A não confunde o aluno",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p12",
        "number": 12,
        "title": "O que olhar na amostra",
        "scenario": "o comitê selecionou 10 trabalhos feitos no ano.",
        "question": "O que deve ser verificado neles?",
        "options": [
          "Se as opiniões emitidas coincidem com as de outras firmas que auditam o mesmo setor.",
          "Se cada trabalho foi concluído dentro do orçamento de horas previsto.",
          "Se os clientes da amostra renovaram o contrato para o ano seguinte.",
          "Se os trabalhos atenderam às normas de auditoria independente, profissionais e técnicas, e às Normas Brasileiras de Contabilidade."
        ],
        "correct": 3,
        "explanation": "sobre a amostra, aplica-se um programa que verifica se as normas de auditoria (profissionais e técnicas) e as Normas Brasileiras de Contabilidade foram atendidas.",
        "feedback": [
          "O critério é o cumprimento das normas, não a coincidência com opiniões de outras firmas.",
          "O orçamento de horas mede eficiência, mas não substitui a avaliação de qualidade.",
          "A renovação do contrato não demonstra o cumprimento das normas.",
          null
        ],
        "connection": "além dos trabalhos, o programa avalia a própria firma. Isso vira um checklist na próxima pergunta.",
        "reference": "NBC T 11.8, item 11.8.5.2 (a) e (b)",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p13",
        "number": 13,
        "title": "O item que não entra no checklist",
        "scenario": "você está montando o checklist dos procedimentos administrativos e técnicos que o programa deve avaliar.",
        "question": "Qual destes itens não faz parte do mínimo exigido?",
        "options": [
          "Registro regular no CRC e procedimentos sobre independência.",
          "Recrutamento e treinamento do pessoal técnico.",
          "Margem de lucro obtida em cada contrato da carteira.",
          "Instalações dos escritórios e comparação entre horas disponíveis e horas contratadas."
        ],
        "correct": 2,
        "explanation": "o mínimo inclui registro no CRC, recrutamento, treinamento, contratação dos serviços, horas disponíveis frente às contratadas, independência e instalações. Lucratividade não está na lista.",
        "feedback": [
          "Registro regular no CRC e independência fazem parte do mínimo exigido.",
          "Recrutamento e treinamento fazem parte do mínimo exigido.",
          null,
          "Instalações e horas disponíveis frente às contratadas fazem parte do mínimo exigido."
        ],
        "connection": "o checklist encontrou falhas. O que fazer com elas é a próxima pergunta.",
        "reference": "NBC T 11.8, item 11.8.5.4",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar. Na tela, o \"não\" do enunciado precisa de destaque visual.",
        "emphasizeNegation": true
      },
      {
        "id": "2026-11-p14",
        "number": 14,
        "title": "Falhas encontradas",
        "scenario": "a verificação anual encontrou três trabalhos sem evidência de revisão do gerente.",
        "question": "Qual o próximo passo?",
        "options": [
          "Elaborar um plano de ação para sanar as falhas e acompanhar a implementação.",
          "Registrar no relatório do comitê e conferir de novo na verificação do próximo ano.",
          "Corrigir os três trabalhos discretamente, sem envolver a equipe.",
          "Tirar esses trabalhos da amostra para não distorcer o resultado."
        ],
        "correct": 0,
        "explanation": "o programa deve incluir um plano de ação para sanar as falhas e o acompanhamento da sua implementação.",
        "feedback": [
          null,
          "Registrar sem agir não sana a falha.",
          "Uma correção discreta não trata a causa nem assegura seu acompanhamento.",
          "Retirar trabalhos para ocultar falhas contraria o objetivo da verificação."
        ],
        "connection": "a P5 mostrou por que revisar em todas as etapas é obrigatório. Aqui, a falta dessa revisão é exatamente o que o controle de qualidade pegou.",
        "reference": "NBC T 11.8, item 11.8.5.5",
        "source": "elaborada a partir da norma",
        "reviewStatus": "pending",
        "reviewNote": "a revisar",
        "emphasizeNegation": false
      },
      {
        "id": "2026-11-p15",
        "number": 15,
        "title": "Auditora sem equipe",
        "scenario": "uma colega abriu um escritório sozinha, sem assistentes, e pergunta se precisa se preocupar com controle de qualidade.",
        "question": "Qual a resposta correta?",
        "options": [
          "Não. Controle de qualidade só se aplica a firmas que têm equipe para supervisionar.",
          "Sim. Sem assistentes, o controle de qualidade é inerente à sua qualificação profissional, e ela continua sujeita às normas.",
          "Sim, e por isso ela precisa contratar ao menos um assistente para ter quem supervisionar.",
          "Não, desde que ela tenha mais de dez anos de registro no CRC."
        ],
        "correct": 1,
        "explanation": "o programa de qualidade se adapta ao tamanho da equipe. Quem trabalha sem assistentes tem o controle de qualidade como parte da própria qualificação profissional.",
        "feedback": [
          "Trabalhar sem assistentes não afasta as normas de qualidade.",
          null,
          "A norma não cria uma obrigação de contratar um assistente.",
          "O tempo de registro no CRC não dispensa o controle de qualidade."
        ],
        "connection": "última pergunta. A qualidade não depende do tamanho da firma: vale para tudo o que foi visto nas três fases.",
        "reference": "NBC T 11.8, itens 11.8.1.9 e 11.8.1.10",
        "source": "adaptada de Unifil, Prefeitura de Guaíra (PR), 2022, Q4533358, alternativa A",
        "reviewStatus": "pending",
        "reviewNote": "a revisar, conferir no livro se esse trecho está no 4.6",
        "emphasizeNegation": false
      }
    ]
  }
];
