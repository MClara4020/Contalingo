import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { connectDatabase } from '../server/store.js';
import { buildReport } from '../server/report.js';
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--output')) {
  console.error('Uso: npm run report -- --output reports/turma.xlsx');process.exit(1);
}
const databasePath=process.env.DATABASE_PATH||'data/contalingo.sqlite';
if(!process.env.TURSO_DATABASE_URL&&!existsSync(databasePath)) { console.error('Banco não encontrado. Inicie a aplicação e cadastre os alunos antes de exportar.');process.exit(1); }
const output=resolve(args[1]||'reports/turma.xlsx');
if(!output.endsWith('.xlsx')) {console.error('O arquivo de saída deve ter a extensão .xlsx.');process.exit(1);}
const db=await connectDatabase();
try {mkdirSync(dirname(output),{recursive:true});const workbook=await buildReport(db);await workbook.xlsx.writeFile(output);console.log(`Planilha gerada: ${output}`);}
finally {db.close();}
