import ExcelJS from 'exceljs';
import type Database from 'better-sqlite3';
import { asStore, type Store } from './store.js';
import { phases, BANK_VERSION } from './questions.js';
import { rankFor, starsFor } from './game.js';

/** All attempts are used for analytics; game scores come only from current best results. */
export function buildReport(input: Database.Database | Store) {
  const db=asStore(input);
  // A single read transaction keeps all sheets consistent while students are playing.
  return db.transaction(async (db) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Contalingo';
    workbook.created = new Date();
    function sheet(name: string, columns: {header:string;key:string;width:number}[]) {
      const tab = workbook.addWorksheet(name, {views:[{state:'frozen',ySplit:1}]});
      tab.columns = columns;
      tab.getRow(1).font = {bold:true,color:{argb:'FFFFFFFF'}};
      tab.getRow(1).fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF2A3066'}};
      tab.getRow(1).height = 26;
      tab.autoFilter = {from:{row:1,column:1},to:{row:1,column:columns.length}};
      return tab;
    }
    const students = sheet('Alunos', [
      {header:'Nome completo',key:'name',width:32},{header:'Matrícula',key:'matricula',width:24},
      {header:'Pontos totais',key:'total',width:16},{header:'Patente',key:'rank',width:20},
      ...phases.flatMap((_,i)=>[
        {header:`Fase ${i+1}: acertos`,key:`correct${i}`,width:17},
        {header:`Fase ${i+1}: pontos`,key:`score${i}`,width:17},
        {header:`Fase ${i+1}: estrelas`,key:`stars${i}`,width:17},
      ]),
      {header:'Todas as tentativas',key:'attempts',width:20},{header:'Derrotas',key:'losses',width:13},
    ]);
    const users = await db.prepare('SELECT id,name,matricula FROM users ORDER BY name,matricula').all() as {id:string;name:string;matricula:string}[];
    for (const u of users) {
      const results=await db.prepare('SELECT phase,correct,score FROM results WHERE user_id=?').all(u.id) as {phase:number;correct:number;score:number}[];
      const total=results.reduce((sum,r)=>sum+r.score,0);
      const counts=await db.prepare("SELECT COUNT(*) AS attempts, COALESCE(SUM(status='lost'),0) AS losses FROM attempts WHERE user_id=?").get(u.id) as {attempts:number;losses:number};
      const row:Record<string,string|number>={name:u.name,matricula:u.matricula,total,rank:rankFor(total),...counts};
      phases.forEach((_,i)=>{const r=results.find(r=>r.phase===i);row[`correct${i}`]=r?.correct??0;row[`score${i}`]=r?.score??0;row[`stars${i}`]=starsFor(r?.correct??0);});
      students.addRow(row);
    }
    const errors=sheet('Erros por questão',[
      {header:'Questão',key:'id',width:20},{header:'Fase',key:'phase',width:9},{header:'Título',key:'title',width:37},
      {header:'Respostas (todas as tentativas)',key:'answers',width:30},{header:'Erros',key:'errors',width:12},
      {header:'Taxa de erro',key:'errorRate',width:15},{header:'Alunos que erraram',key:'students',width:22},
      ...'ABCD'.split('').map(letter=>({header:`Escolheram ${letter}`,key:letter,width:17})),
    ]);
    const errorRows=await db.prepare(`SELECT q.id,q.phase,q.payload,COUNT(r.id) AS answers,
      COALESCE(SUM(r.is_correct=0),0) AS errors,
      COUNT(DISTINCT CASE WHEN r.is_correct=0 THEN a.user_id END) AS students,
      COALESCE(SUM(r.selected_option=0),0) AS A,COALESCE(SUM(r.selected_option=1),0) AS B,
      COALESCE(SUM(r.selected_option=2),0) AS C,COALESCE(SUM(r.selected_option=3),0) AS D
      FROM questions q LEFT JOIN responses r ON r.question_id=q.id LEFT JOIN attempts a ON a.id=r.attempt_id
      WHERE q.bank_version=? OR r.id IS NOT NULL GROUP BY q.id ORDER BY errors DESC,q.phase,q.position`).all(BANK_VERSION) as {id:string;phase:number;payload:string;answers:number;errors:number;students:number;A:number;B:number;C:number;D:number}[];
    for(const row of errorRows) errors.addRow({...row,phase:row.phase+1,title:JSON.parse(row.payload).title,errorRate:row.answers?row.errors/row.answers:0});
    errors.getColumn('errorRate').numFmt='0.0%';
    const attempts=sheet('Tentativas',[
      {header:'ID',key:'id',width:38},{header:'Matrícula',key:'matricula',width:24},{header:'Nome',key:'name',width:30},
      {header:'Fase',key:'phase',width:8},{header:'Início (UTC)',key:'created_at',width:27},{header:'Fim (UTC)',key:'ended_at',width:27},
      {header:'Acertos',key:'correct',width:10},{header:'Pontos da tentativa',key:'score',width:20},{header:'Vidas restantes',key:'lives',width:17},
      {header:'Resultado',key:'status',width:16},{header:'Versão do banco de questões',key:'bank_version',width:28},
    ]);
    const statuses:Record<string,string>={active:'Em andamento',complete:'Vitória',lost:'Derrota',abandoned:'Interrompida'};
    const attemptRows=await db.prepare('SELECT a.*,u.name,u.matricula FROM attempts a JOIN users u ON u.id=a.user_id ORDER BY a.created_at,a.id').all() as {phase:number;status:string}[];
    attemptRows.forEach(row=>attempts.addRow({...row,phase:row.phase+1,status:statuses[row.status]||row.status}));
    const responses=sheet('Respostas',[
      {header:'Tentativa',key:'attempt_id',width:38},{header:'Matrícula',key:'matricula',width:24},{header:'Questão',key:'question_id',width:20},
      {header:'Posição na fase',key:'position',width:17},{header:'Alternativa escolhida',key:'selected_option',width:23},
      {header:'Acertou',key:'is_correct',width:12},{header:'Respondida em (UTC)',key:'answered_at',width:27},
    ]);
    const responseRows=await db.prepare('SELECT r.*,u.matricula FROM responses r JOIN attempts a ON a.id=r.attempt_id JOIN users u ON u.id=a.user_id ORDER BY a.created_at,a.id,r.position').all() as {position:number;selected_option:number;is_correct:number}[];
    responseRows.forEach(row=>responses.addRow({...row,position:row.position+1,selected_option:'ABCD'[row.selected_option],is_correct:row.is_correct?'Sim':'Não'}));
    const notes=workbook.addWorksheet('Sobre o relatório');
    notes.columns=[{header:'Item',key:'item',width:27},{header:'Descrição',key:'description',width:110}];
    [
      ['Gerado em (UTC)',new Date().toISOString()],
      ['Pontuação','Somente a melhor tentativa de cada fase da jornada atual; máximo de 165 pontos.'],
      ['Análise de erros','Inclui todas as respostas: vitórias, derrotas, tentativas interrompidas e jornadas anteriores.'],
      ['Datas antigas','Células vazias indicam datas não registradas na versão anterior; elas não foram estimadas.'],
      ['Questões anteriores','IDs legacy identificam as perguntas anteriores à importação do DOCX.'],
      ['Revisão pedagógica','As questões do DOCX estão a revisar. P10, P11 e P15 têm conferências específicas pendentes no livro.'],
      ['Referência histórica','Conteúdo baseado no material didático fornecido e na NBC T 11.8 de 2005; não é uma declaração de norma vigente.'],
    ].forEach(([item,description])=>notes.addRow({item,description}));
    return workbook;
  }, 'read')();
}
