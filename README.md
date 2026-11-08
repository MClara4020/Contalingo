# Contalingo

Jogo de auditoria independente com React e TypeScript, API Express e banco SQLite persistente. O conteúdo acompanha os documentos **Contalingo – Rascunho do Jogo.pdf** e **Contalingo – Banco de questões e próximos passos.docx**, com as atualizações do DOCX aplicadas sobre o rascunho.

## Executar localmente

Requer Node.js 18.20+ e npm. Para a hospedagem, utilize uma versão LTS mantida do Node.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`). O comando inicia frontend e API juntos. Crie uma conta com **nome completo, matrícula e senha**; depois entre com matrícula e senha. A matrícula é normalizada para maiúsculas, preservando zeros iniciais, e admite até 40 letras, números, pontos, barras ou hífens. A senha deve ter entre 8 e 128 caracteres.

```bash
npm test         # conteúdo, integração HTTP, migração e planilha
npm run build    # verifica TypeScript e gera dist/
npm run test:e2e # fluxo no Chrome: cadastro, derrota, 3 fases, resultado e celular
```

O teste de navegador utiliza o Chrome instalado em `/usr/bin/google-chrome`; defina `CHROME_PATH` se estiver em outro caminho. Ele usa portas e um banco temporários, sem alterar o banco real. A simulação de celular não substitui testes em aparelhos Android/iOS reais.

## Conta de teste local

A conta de teste usa matrícula **TESTE** e senha **Contalingo123**.

Para criá-la no banco configurado, execute:

```bash
npm run seed:test
```

O comando é manual e não cria contas automaticamente na inicialização. Executá-lo novamente preserva o progresso e a senha existente; se a matrícula já tiver outra senha, ele informa o conflito sem alterar a conta. Use a matrícula no campo de login.

## Regras e fluxo

- Início → mapa de fases → pergunta e feedback → fim de fase → resultado final.
- São três fases, com cinco perguntas e quatro alternativas cada; apenas uma é correta.
- Cada fase começa com três vidas. Acerto: +10 pontos; erro: −1 vida.
- Concluir sem perder vidas dá +5 pontos. A pontuação máxima é 165.
- Ao terminar as cinco perguntas com vidas, a fase seguinte é liberada. Não há uma regra separada de três acertos: quem termina já acertou pelo menos três.
- Três, quatro ou cinco acertos dão uma, duas ou três estrelas.
- A resposta que zera as vidas também mostra seu feedback antes da tela de derrota.
- Somente a melhor tentativa de cada fase conta na pontuação atual.
- As questões e alternativas mantêm a ordem do DOCX. As ligações dos feedbacks fazem parte de uma narrativa sequencial.
- Recomeçar a jornada zera os melhores resultados e bloqueia as fases seguintes, mas mantém tentativas e respostas para análise da professora.

Patentes: Estagiário (0–59), Auditor Júnior (60–99), Auditor Sênior (100–139) e Sócio (140–165).

## Conteúdo e revisão pedagógica

As 15 questões do DOCX estão em `server/questions.ts`, com título, cenário, alternativas, gabarito, explicação, feedback por alternativa, ligação, referência, fonte e pendências de revisão. Os textos individuais dos distratores foram separados a partir das explicações coletivas do documento. O frontend recebe somente o feedback da alternativa escolhida e não importa o gabarito.

Cada feedback mostra a explicação da resposta correta, o erro da escolha do aluno (somente quando erra), a ligação narrativa, o item da NBC T 11.8 e o rodapé `Conteúdo: item 4.x`. Na P13, o **NÃO** recebe destaque visual.

**O conteúdo está preparado para revisão, sem aprovação pedagógica presumida.** Todas as questões mantêm `reviewStatus: pending`. As P10, P11 e P15 têm conferências específicas com o livro. A referência é a norma histórica de 2005 adotada pelos documentos; não é uma declaração de norma vigente. A revisão com o livro completo e a aprovação por Maria Luiza e outro integrante continuam sob responsabilidade do grupo, como descrito no material. Não houve publicação externa.

Consulte [docs/alinhamento-documentos.md](docs/alinhamento-documentos.md) para o registro das alterações e pendências humanas.

## Planilha da professora

Após cadastrar alunos e jogar, no computador/servidor que contém o banco:

```bash
npm run report -- --output reports/turma.xlsx
```

Para outro banco, defina `DATABASE_PATH`. O comando gera um arquivo Excel com as abas:

1. **Alunos:** nome, matrícula, pontuação atual, patente, acertos/pontos/estrelas por fase e número de tentativas e derrotas.
2. **Erros por questão:** respostas, erros, taxa de erro, alunos que erraram e distribuição entre A/B/C/D, ordenada pela quantidade de erros.
3. **Tentativas:** início, fim, fase, acertos, pontos, vidas restantes e resultado, incluindo derrotas e interrupções.
4. **Respostas:** tentativa, matrícula, questão, posição, alternativa, acerto e data.
5. **Sobre o relatório:** critérios de cálculo e observações.

A análise usa **todas as tentativas**, incluindo jornadas anteriores. A pontuação usa somente os melhores resultados da jornada atual. A exportação é um comando administrativo local; alunos não têm uma rota HTTP para acessar os dados da turma. A planilha não contém senhas ou tokens de sessão. Matrículas são células de texto, inclusive quando começam com zero.

## Banco e migração

O banco é criado automaticamente em `data/contalingo.sqlite`:

- `users`: nome, matrícula única, hash da senha, data de cadastro.
- `sessions`: hash de token, usuário, expiração.
- `questions`: questões versionadas, payload, explicação, `feedback_a` a `feedback_d`, ligação e status de revisão.
- `attempts`: usuário, fase, ordem das questões, início/fim, acertos, pontos, vidas, status e versão do conteúdo.
- `responses`: tentativa, pergunta, posição, alternativa, acerto e data; uma resposta por posição.
- `results`: melhor tentativa por usuário/fase, usada na pontuação atual.

A migração para a versão 2 preserva usuários, sessões, pontuação e respostas da versão anterior. Contas antigas podem entrar informando o e-mail anterior no campo Matrícula, com a mesma senha. As tentativas antigas continuam vinculadas às perguntas antigas (`legacy-*`), para não reinterpretar seus acertos com o novo gabarito. Tentativas antigas em andamento são marcadas como interrompidas. Datas não registradas pela versão anterior permanecem vazias no relatório; não são estimadas.

Os IDs das questões são versionados. Para substituir futuramente questões já utilizadas, crie uma nova `BANK_VERSION` e novos IDs; não reutilize IDs com outro gabarito. A carga é idempotente e não sobrescreve perguntas históricas.

## API

Operações de escrita recebem JSON. A sessão é um cookie HttpOnly/SameSite de sete dias, Secure em produção. Erros retornam `{ "error": "mensagem" }` com status HTTP apropriado. Há validação de entrada, verificação de origem, limite de requisições e hash de senha com scrypt e salt aleatório.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/health` | Saúde da API e banco |
| POST | `/api/auth/register` | `{name, matricula, password}` |
| POST | `/api/auth/login` | `{matricula, password}` |
| POST | `/api/auth/logout` | Encerra a sessão atual |
| GET | `/api/me` | Perfil, matrícula, total, patente e melhores resultados |
| PATCH | `/api/me` | `{name}` |
| DELETE | `/api/me/progress` | Zera resultados atuais, preservando o histórico |
| GET | `/api/phases` | Metadados e introduções, sem gabarito |
| POST | `/api/attempts` | `{phase}`: índice 0, 1 ou 2 |
| GET | `/api/attempts/:id` | Estado da própria tentativa e próxima pergunta |
| POST | `/api/attempts/:id/answers` | `{index, option}`: índices a partir de zero, opção 0 a 3 |

A resposta ao envio de uma alternativa contém `attempt`, `feedback` e `progress`. A última resposta salva o resultado em uma transação. O servidor rejeita respostas duplicadas, fora de ordem e de outro usuário. Novas tentativas encerram a tentativa ativa anterior. Recarregar a página retorna ao início, sem perder os resultados já concluídos.

## Produção

```bash
npm ci
npm run build
APP_ORIGIN=https://seu-dominio.com HOST=127.0.0.1 PORT=3001 npm start
```

O servidor serve API e `dist/`. Use um proxy HTTPS e `APP_ORIGIN` com a origem pública exata, sem barra final. As variáveis estão em `.env.example`; defina-as no ambiente, pois `.env` não é carregado automaticamente. `npm run preview` serve apenas o frontend.

Defina `DATABASE_PATH` para alterar o arquivo do banco e use um volume persistente gravável. Para backup simples consistente, pare o processo, copie todo o diretório `data/` e reinicie. Banco, relatórios e backups não devem ser publicados. SQLite e limitador em memória foram configurados para uma única instância do servidor.
