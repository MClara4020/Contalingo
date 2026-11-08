import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { type AddressInfo } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
import { openDatabase } from './db.js';
import { phases } from './questions.js';
import { buildReport } from './report.js';
import { createClient } from '@libsql/client';
import { initializeLibsql, libsqlStore } from './store.js';
const directory=mkdtempSync(join(tmpdir(),'contalingo-test-'));
const db=openDatabase(join(directory,'test.sqlite'));
const client=process.env.TEST_DATABASE_DRIVER==='libsql'?createClient({url:`file:${join(directory,'test.sqlite')}`}):undefined;
if(client)await initializeLibsql(client);
const backend=client?libsqlStore(client):db;
const server=createApp(backend).listen(0,'127.0.0.1');
let base=''; let cookie='';let counter=0;
before(async()=>{if(!server.listening)await new Promise<void>(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;});
after(async()=>{await new Promise<void>(resolve=>server.close(()=>resolve()));client?.close();db.close();rmSync(directory,{recursive:true,force:true});});
async function request(path:string,method='GET',body?:unknown,session=cookie,origin?:string){const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session}:{}),...(origin?{Origin:origin}:{})},body:method==='GET'?undefined:JSON.stringify(body??{})});return {status:response.status,body:await response.json() as any,cookie:response.headers.get('set-cookie')?.split(';')[0],headers:response.headers};}
async function register(){const r=await request('/auth/register','POST',{name:'Aluno',matricula:`2026-${++counter}`,password:'senha-segura123'});assert.equal(r.status,201);cookie=r.cookie!;return r;}
function correctOption(phase:number,question:{scenario:string}){return phases[phase].questions.find(q=>q.scenario===question.scenario)!.correct;}
async function play(phase:number,mistakes:number[]=[]) {let r=await request('/attempts','POST',{phase});assert.equal(r.status,201);let a=r.body;const id=a.id;for(let i=0;i<5;i++){let option=correctOption(phase,a.question);if(mistakes.includes(i))option=(option+1)%4;r=await request(`/attempts/${id}/answers`,'POST',{index:i,option,score:99999,correct:5,lives:3});assert.equal(r.status,200);a=r.body.attempt;if(a.status!=='active')break;}return r.body;}
test('autenticação obrigatória e validação de entrada',async()=>{assert.equal((await request('/me','GET',undefined,'')).status,401);assert.equal((await request('/auth/register','POST',{name:'',matricula:'ruim',password:'1'})).status,400);assert.equal((await request('/health')).body.status,'ok');});
test('cadastro, senha protegida, sessão, perfil e login',async()=>{const r=await register();const user=db.prepare('SELECT * FROM users WHERE matricula=?').get(r.body.matricula) as {password:string};assert.notEqual(user.password,'senha-segura123');assert.ok(r.headers.get('set-cookie')?.includes('HttpOnly'));assert.ok(r.headers.get('set-cookie')?.includes('SameSite=Lax'));assert.deepEqual((await request('/me')).body.results,[null,null,null]);assert.equal((await request('/me','PATCH',{name:'Maria'})).body.name,'Maria');assert.equal((await request('/auth/register','POST',{name:'Outro',matricula:r.body.matricula,password:'senha-segura123'})).status,409);assert.equal((await request('/auth/login','POST',{matricula:r.body.matricula,password:'senha-errada'})).status,401);const login=await request('/auth/login','POST',{matricula:r.body.matricula,password:'senha-segura123'});assert.equal(login.status,200);assert.equal(login.body.name,'Maria');});
test('proteção contra requisições de outra origem',async()=>{await register();assert.equal((await request('/me','PATCH',{name:'Invasor'},cookie,'https://outro.example')).status,403);assert.equal((await request('/me')).body.name,'Aluno');});
test('gabarito não aparece nos metadados ou no início da tentativa',async()=>{await register();const p=await request('/phases');assert.equal(p.body.length,3);assert.equal(p.body[0].questions,undefined);const a=await request('/attempts','POST',{phase:0});assert.equal(a.body.question.correct,undefined);assert.equal(a.body.question.explanation,undefined);assert.equal((await request('/attempts','POST',{phase:1})).status,403);assert.equal((await request('/attempts','POST',{phase:-1})).status,400);});
test('respostas fora de ordem, inválidas e duplicadas não pontuam',async()=>{await register();const a=(await request('/attempts','POST',{phase:0})).body;assert.equal((await request(`/attempts/${a.id}/answers`,'POST',{option:0,index:1})).status,409);assert.equal((await request(`/attempts/${a.id}/answers`,'POST',{option:4,index:0})).status,400);const option=correctOption(0,a.question);const responses=await Promise.all([request(`/attempts/${a.id}/answers`,'POST',{option,index:0}),request(`/attempts/${a.id}/answers`,'POST',{option,index:0})]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);const state=(await request(`/attempts/${a.id}`)).body;assert.equal(state.correct,1);assert.equal(state.index,1);});
test('três fases perfeitas somam 165 pontos e repetir não acumula',async()=>{await register();for(let p=0;p<3;p++){const r=await play(p);assert.equal(r.attempt.status,'complete');assert.equal(r.progress.results[p].score,55);}let result=(await request('/me')).body;assert.equal(result.results.reduce((sum:number,r:{score:number})=>sum+r.score,0),165);await play(0,[0,1]);result=(await request('/me')).body;assert.equal(result.results[0].score,55);});
test('três acertos liberam a próxima fase e concedem 30 pontos',async()=>{await register();const r=await play(0,[0,2]);assert.equal(r.attempt.correct,3);assert.equal(r.attempt.lives,1);assert.equal(r.progress.results[0].score,30);assert.equal((await request('/attempts','POST',{phase:1})).status,201);});
test('perder três vidas encerra tentativa e não libera próxima fase',async()=>{await register();const r=await play(0,[0,1,2]);assert.equal(r.attempt.status,'lost');assert.equal(r.attempt.lives,0);assert.equal(r.progress.results[0],null);assert.equal((await request(`/attempts/${r.attempt.id}/answers`,'POST',{option:0,index:3})).status,409);assert.equal((await request('/attempts','POST',{phase:1})).status,403);});
test('tentativas pertencem ao aluno e são invalidadas em um recomeço',async()=>{await register();const a=(await request('/attempts','POST',{phase:0})).body;await request('/attempts','POST',{phase:0});assert.equal((await request(`/attempts/${a.id}/answers`,'POST',{option:0,index:0})).status,409);await register();assert.equal((await request(`/attempts/${a.id}`)).status,404);assert.equal((await request(`/attempts/${a.id}/answers`,'POST',{option:0,index:0})).status,404);});
test('SQLite mantém progresso após reabrir a conexão',async()=>{await register();await play(0);const second=openDatabase(join(directory,'test.sqlite'));const row=second.prepare('SELECT COUNT(*) AS count FROM results').get() as {count:number};assert.ok(row.count>0);second.close();});
test('reiniciar preserva tentativas, zera resultados e sair invalida sessão',async()=>{await register();await play(0);const a=(await request('/attempts','POST',{phase:0})).body;assert.deepEqual((await request('/me/progress','DELETE')).body.results,[null,null,null]);assert.equal((await request(`/attempts/${a.id}`)).body.status,'abandoned');assert.equal((await request('/auth/logout','POST')).status,200);assert.equal((await request('/me')).status,401);});

test('questões mantêm a ordem narrativa, feedback específico e referência ao tópico',async()=>{
 await register();
 const a=(await request('/attempts','POST',{phase:0})).body;
 assert.equal(a.question.id,'2026-11-p1');
 const r=await request(`/attempts/${a.id}/answers`,'POST',{option:0,index:0});
 assert.equal(r.body.feedback.correct,2);
 assert.equal(r.body.feedback.selectedExplanation,phases[0].questions[0].feedback[0]);
 assert.equal(r.body.feedback.connection,phases[0].questions[0].connection);
 assert.equal(r.body.feedback.reference,phases[0].questions[0].reference);
 assert.equal(r.body.feedback.topic,'4.4');
 assert.equal(r.body.attempt.question.id,'2026-11-p2');
 assert.equal(r.body.attempt.question.correct,undefined);
 const second=await request(`/attempts/${a.id}/answers`,'POST',{option:0,index:1});
 assert.equal(second.body.feedback.selectedExplanation,null);
 const rows=db.prepare('SELECT * FROM responses WHERE attempt_id=? ORDER BY position').all(a.id) as {is_correct:number;question_id:string;selected_option:number}[];
 assert.equal(rows.length,2);assert.equal(rows[0].is_correct,0);assert.equal(rows[1].is_correct,1);
 assert.equal(rows[0].question_id,'2026-11-p1');assert.equal(rows[0].selected_option,0);
});
test('feedback da resposta que zera vidas é retornado antes da derrota',async()=>{
 await register();const r=await play(0,[0,1,2]);
 assert.equal(r.attempt.status,'lost');assert.equal(r.attempt.lives,0);
 assert.ok(r.feedback.explanation);assert.ok(r.feedback.selectedExplanation);assert.ok(r.feedback.connection);
 const attempt=db.prepare('SELECT * FROM attempts WHERE id=?').get(r.attempt.id) as {ended_at:string;correct:number;lives:number};
 assert.ok(attempt.ended_at);assert.equal(attempt.lives,0);assert.equal(attempt.correct,0);
});
test('planilha reúne alunos, melhores resultados e erros de todas as tentativas',async()=>{
 const student=await register();const enrollment=student.body.matricula;
 await play(0,[0,1,2]); // Derrota.
 await play(0);        // Melhor tentativa: 55.
 await play(0,[0]);    // Vitória inferior: não substitui 55.
 const workbook=await buildReport(backend);
 const buffer=await workbook.xlsx.writeBuffer();
 assert.ok(buffer.byteLength>0);
 const students=workbook.getWorksheet('Alunos')!;
 const row=students.getRows(2,students.rowCount-1)!.find(row=>row.getCell('matricula').value===enrollment)!;
 assert.equal(row.getCell('total').value,55);assert.equal(row.getCell('correct0').value,5);
 assert.equal(row.getCell('attempts').value,3);assert.equal(row.getCell('losses').value,1);
 const attempts=workbook.getWorksheet('Tentativas')!;
 const studentAttempts=attempts.getRows(2,attempts.rowCount-1)!.filter(row=>row.getCell('matricula').value===enrollment);
 assert.equal(studentAttempts.length,3);assert.ok(studentAttempts.every(row=>row.getCell('ended_at').value));
 await request('/me/progress','DELETE');
 const afterReset=await buildReport(backend);
 const tab=afterReset.getWorksheet('Alunos')!;
 const resetRow=tab.getRows(2,tab.rowCount-1)!.find(row=>row.getCell('matricula').value===enrollment)!;
 assert.equal(resetRow.getCell('total').value,0);assert.equal(resetRow.getCell('attempts').value,3);
 const responses=afterReset.getWorksheet('Respostas')!;
 assert.equal(responses.getRows(2,responses.rowCount-1)!.filter(row=>row.getCell('matricula').value===enrollment).length,13);
 const errorTab=afterReset.getWorksheet('Erros por questão')!;
 const p1=errorTab.getRows(2,errorTab.rowCount-1)!.find(row=>row.getCell('id').value==='2026-11-p1')!;
 const expected=db.prepare("SELECT COUNT(*) AS count FROM responses WHERE question_id='2026-11-p1' AND is_correct=0").get() as {count:number};
 assert.equal(p1.getCell('errors').value,expected.count);
 const strings=JSON.stringify(workbook.model);
 assert.ok(!strings.includes('senha-segura123'));assert.ok(!strings.includes('password'));
});
