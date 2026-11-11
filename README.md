# Contalingo

Jogo de auditoria independente com React e TypeScript, API Express e banco SQLite local, PostgreSQL (incluindo Neon) ou Turso/libSQL remoto. O conteúdo acompanha os documentos **Contalingo – Rascunho do Jogo.pdf** e **Contalingo – Banco de questões e próximos passos.docx**, com as atualizações do DOCX aplicadas sobre o rascunho.

## Executar localmente

Use **Node.js 22.x** e npm, conforme `engines.node` e `.nvmrc`. Esse limite evita a falha de compilação do `better-sqlite3` 11 com Node 26. Ao trocar a versão do Node, execute `npm ci` para reinstalar os módulos nativos.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`). O comando inicia frontend e API juntos. Crie uma conta com **nome completo, matrícula e senha**; depois entre com matrícula e senha. A matrícula é normalizada para maiúsculas, preservando zeros iniciais, e admite até 40 letras, números, pontos, barras ou hífens. A senha deve ter entre 8 e 128 caracteres.

Para usar PostgreSQL localmente, copie `.env.example` para `.env` e configure `DATABASE_URL`. Os comandos `npm run dev` e `npm run start` carregam esse arquivo automaticamente; ele é ignorado pelo Git. Outros comandos, como `npm run report`, precisam receber as variáveis pelo ambiente.

```bash
npm test         # conteúdo, integração HTTP, migração, planilha e handler Vercel
npm run test:libsql # mesmas regras da API pelo driver libSQL
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

Para outro banco local, defina `DATABASE_PATH`. Para exportar o banco hospedado, defina `DATABASE_URL` (PostgreSQL) ou `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` (Turso/libSQL) no ambiente do comando. O comando gera um arquivo Excel com as abas:

1. **Alunos:** nome, matrícula, pontuação atual, patente, acertos/pontos/estrelas por fase e número de tentativas e derrotas.
2. **Erros por questão:** respostas, erros, taxa de erro, alunos que erraram e distribuição entre A/B/C/D, ordenada pela quantidade de erros.
3. **Tentativas:** início, fim, fase, acertos, pontos, vidas restantes e resultado, incluindo derrotas e interrupções.
4. **Respostas:** tentativa, matrícula, questão, posição, alternativa, acerto e data.
5. **Sobre o relatório:** critérios de cálculo e observações.

A análise usa **todas as tentativas**, incluindo jornadas anteriores. A pontuação usa somente os melhores resultados da jornada atual. A exportação é um comando administrativo local; alunos não têm uma rota HTTP para acessar os dados da turma. A planilha não contém senhas ou tokens de sessão. Matrículas são células de texto, inclusive quando começam com zero.

## Banco e migração

Com `DATABASE_URL`, o servidor usa PostgreSQL e cria as tabelas e questões na primeira conexão. Essa variável tem precedência sobre as opções abaixo. Se não estiver definida, o projeto usa Turso/libSQL quando `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão configuradas; sem ambas, usa o SQLite local em `data/contalingo.sqlite`. Configure as credenciais apenas no servidor:

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

## Hospedar na Vercel

O projeto contém `vercel.json`, com frontend Vite em `dist/` e a função `api/index.ts` para `/api/*`. A API é iniciada pela Vercel, sem `listen()`. O frontend e a API usam o mesmo domínio, preservando cookies de sessão e a verificação de origem.

1. Crie um banco PostgreSQL (por exemplo, Neon) e obtenha a URL de conexão, ou crie um banco Turso/libSQL e obtenha sua URL `libsql://...` e token de escrita.
2. Em **Settings → Environment Variables** do projeto Vercel, cadastre:

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | URL PostgreSQL completa, armazenada como segredo no servidor (opcional se usar Turso) |
   | `TURSO_DATABASE_URL` | URL do banco, como `libsql://seu-banco-sua-organizacao.turso.io` |
   | `TURSO_AUTH_TOKEN` | Token do banco com permissão de escrita |
   | `APP_ORIGIN` | Origem HTTPS do domínio usado pelos alunos, sem barra final, por exemplo `https://contalingo.vercel.app` |

   Configure `DATABASE_URL` para PostgreSQL ou configure as duas variáveis Turso; se ambas as opções estiverem definidas, `DATABASE_URL` tem precedência. `APP_ORIGIN` é recomendado para o domínio de produção; sem ele a API valida a origem contra o host/protocolo recebidos da Vercel. Se usar domínios de preview, configure `APP_ORIGIN` por ambiente ou deixe-a sem valor no preview, em vez de usar o domínio de produção.

3. Use **Node.js 22.x**, **Framework Preset: Vite**, **Install Command: npm ci --include=dev --ignore-scripts**, **Build Command: npm run build** e **Output Directory: dist**. A versão `22.x` em `package.json` prevalece sobre o padrão Node 26 do projeto.
4. Faça um novo deploy, desmarcando o reaproveitamento do cache de build após a mudança de Node. O build instala as dependências e compila, mas não depende de credenciais para consultar o banco.
5. Acesse `/api/health` no domínio implantado: deve retornar `{ "status": "ok" }`. Depois teste cadastro, login e uma fase.

As tabelas e as 15 questões são criadas no banco remoto de forma idempotente na primeira requisição. Contas e progresso sobrevivem a novos deploys porque ficam no PostgreSQL ou Turso. Sem credenciais, a função retorna HTTP 503 e **não cria um banco descartável em `/tmp`**.

Não use o arquivo `data/contalingo.sqlite` como banco de produção na Vercel. O sistema de arquivos das funções não é um disco persistente da aplicação. O PostgreSQL usa um pool pequeno de conexões e o driver libSQL usa `@libsql/client/web`, por HTTP. O `better-sqlite3` é opcional e a instalação da Vercel desativa scripts de instalação para impedir a compilação do addon local. No computador de desenvolvimento, use `npm ci` normalmente para instalar o SQLite local.

O banco SQLite local e a conta TESTE não são enviados automaticamente para PostgreSQL ou Turso. É possível cadastrar novas contas no site ou criar a conta de teste executando `npm run seed:test` com as variáveis do banco definidas localmente. A inicialização cria as tabelas e questões, mas não migra contas nem progresso existentes; faça uma migração de dados separada se precisar preservá-los.

As credenciais ficam apenas no servidor. Não use prefixo `VITE_` para URLs/tokens e não coloque seus valores em arquivos versionados. A exportação de planilhas continua sendo um comando administrativo local com acesso ao banco, não uma rota pública da Vercel.

Referências: [versões de Node na Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [SQLite na Vercel](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel), [cliente TypeScript do Turso](https://docs.turso.tech/sdk/ts/reference).

## Produção em servidor próprio

```bash
npm ci
npm run build
APP_ORIGIN=https://seu-dominio.com HOST=127.0.0.1 PORT=3001 npm start
```

O servidor serve API e `dist/`. Use um proxy HTTPS e `APP_ORIGIN` com a origem pública exata, sem barra final. As variáveis estão em `.env.example`; configure-as no ambiente da hospedagem. Localmente, `npm run dev` e `npm run start` carregam `.env`. `npm run preview` serve apenas o frontend.

Defina `DATABASE_URL` para usar PostgreSQL também em um servidor próprio. Sem credenciais remotas, defina `DATABASE_PATH` para alterar o arquivo SQLite e use um volume persistente gravável. O `.env.example` é apenas um modelo: os scripts dev/start carregam `.env` para uso local. Banco, relatórios e backups não devem ser publicados. O SQLite local requer uma única instância. O limitador de requisições em memória atua por instância do servidor; na Vercel ele não representa um limite global entre funções.

### Se o log ainda mostrar Node 26 ou erro do better-sqlite3

Isso indica que a implantação ainda está usando uma configuração ou revisão diferente da preparada aqui. Confirme:

- O commit implantado contém o `package.json`, `package-lock.json` e `vercel.json` atualizados.
- **Settings → General → Root Directory** aponta para a pasta que contém esses arquivos (se o repositório tem uma pasta `Contalingo`, selecione-a).
- **Settings → Build and Deployment → Node.js Version** está em **22.x**.
- Se houver override de **Install Command** no painel, desative-o para usar `vercel.json` ou configure exatamente `npm ci --include=dev --ignore-scripts`.
- Crie uma nova implantação a partir do commit atualizado, sem reaproveitar o cache. Reimplantar o mesmo commit antigo não inclui as alterações locais.
