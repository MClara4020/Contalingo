# Alinhamento com os documentos fornecidos

Fontes: `Contalingo – Rascunho do Jogo.pdf` (6 páginas) e `Contalingo – Banco de questões e próximos passos.docx` (3/11/2026). O DOCX complementa e atualiza o rascunho. A solicitação do usuário autorizou atualizar o projeto; atribuições pessoais e próximos passos descritos nos documentos não foram tratados como autorização para contatar o grupo ou criar arquivos em serviços externos.

## Implementação

| Requisito | Implementação |
| --- | --- |
| 3 fases, 5 perguntas, 4 alternativas e 1 resposta correta | Banco do DOCX em `server/questions.ts`; carga em `questions` |
| Narrativa única | Ordem P1–P15 preservada; introdução por fase e ligação por feedback |
| Gabaritos | Fase 1: C A D B D; fase 2: A B C D A; fase 3: B D C A B |
| Feedback em três partes e referência | Explicação sempre; erro da alternativa somente quando necessário; ligação sempre; referência à NBC e item do livro |
| Feedback maior com rolagem | Bloco com altura limitada, rolagem e foco de teclado |
| P13 negativa | Palavra NÃO com destaque no enunciado |
| Nome completo, matrícula única e senha | Formulários e API; matrícula normalizada; senha com scrypt |
| 3 vidas, +10 acerto, +5 sem erro | Regras executadas no servidor |
| Remover condição redundante de 3 acertos | Fase termina ao responder 5 perguntas com vidas restantes |
| Melhor tentativa por fase | `results`, sem somar repetições |
| Feedback antes da derrota | Última resposta devolve feedback; botão leva à tela de derrota |
| Estrelas, pontos e patente | Cálculo central no servidor; máximo 165 |
| Início, mapa, pergunta, feedback, vitória/derrota e resultado | Telas React com login, cadastro e Como jogar |
| Resultado com resumo por fase, jogar novamente e voltar ao início | Resumo com acertos e pontos; recomeço com confirmação |
| Todas as tentativas e respostas | `attempts` e `responses`, inclusive derrotas e interrupções |
| Início/fim, acertos, pontos, vidas e resultado da tentativa | Campos persistidos e exportados |
| Planilha de acompanhamento | Comando `npm run report`, abas Alunos, Erros por questão, Tentativas e Respostas |
| Análise usa todas as tentativas | Recomeçar não remove histórico; relatório inclui jornadas anteriores |
| Fontes e status de revisão | Metadados preservados, sem atribuir aprovações fictícias |
| Compatibilidade com dados anteriores | Migração testada, contas e resultados preservados; perguntas antigas mantidas para histórico |

Não foi adicionado ranking, que é opcional no rascunho. A atribuição de desenhar wireframes no Figma permanece uma atividade do grupo e não é uma dependência para executar a aplicação local.

## Revisão humana ainda necessária

As 15 questões do DOCX estão marcadas como **a revisar**. O jogo local disponibiliza o banco para essa revisão, sem classificá-lo como aprovado. O livro completo não foi fornecido; a fidelidade pedagógica final não foi verificada contra ele.

- P10: confirmar se o conteúdo pertence ao tópico 4.5 ou 4.6 no Crepaldi.
- P11: confirmar a periodicidade anual na edição do livro e avaliar se a alternativa dos quatro anos causa confusão.
- P15: confirmar se a passagem sobre profissional sem assistentes pertence ao tópico 4.6.
- Todas: revisão por Maria Luiza e mais um integrante do grupo, conforme o fluxo editorial descrito no DOCX.

A NBC T 11.8 de 2005 é tratada como referência histórica do material, sem afirmação de vigência normativa atual. A frase do distrator da P11 foi contextualizada dessa forma.

## Validação

Os testes automatizados cobrem estrutura e gabaritos do banco, feedback por alternativa, respostas que zeram as vidas, login, pontuação, estrelas e limites de patentes, bloqueios, duplicação de respostas, isolamento entre alunos, persistência, migração e planilha. Os testes de navegador cobrem o fluxo completo no Chrome e uma viewport móvel.

O teste de usabilidade com 3–5 alunos, o registro de percepções e os testes em Android/iOS reais, Safari e Edge dependem de pessoas e dispositivos externos e não foram declarados como realizados. Nenhuma aprovação ou publicação externa foi efetuada.
