import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phases, BANK_VERSION } from './questions.js';
import { openDatabase, phaseQuestions } from './db.js';
import { rankFor, starsFor } from './game.js';

test('banco contém as 15 questões do DOCX, gabaritos e feedback por alternativa',()=>{
  const keys=['CADBD','ABCDA','BDCAB'];
  const seen=new Set<string>();
  phases.forEach((phase,p)=>{
    assert.equal(phase.topic,`4.${p+4}`);assert.equal(phase.questions.length,5);
    assert.equal(phase.questions.map(q=>'ABCD'[q.correct]).join(''),keys[p]);
    phase.questions.forEach(q=>{
      assert.ok(!seen.has(q.scenario));seen.add(q.scenario);
      assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
      assert.equal(q.feedback.length,4);assert.equal(q.feedback[q.correct],null);
      assert.ok(q.feedback.every((feedback,i)=>i===q.correct||!!feedback));
      assert.ok(q.explanation);assert.ok(q.connection);assert.match(q.reference,/NBC T 11.8/);
      assert.equal(q.reviewStatus,'pending');assert.ok(q.reviewNote);assert.ok(q.source);
    });
  });
  assert.equal(seen.size,15);
  assert.ok(phases[2].questions[2].emphasizeNegation);
  for(const n of [10,11,15]) assert.match(phases.flatMap(p=>p.questions).find(q=>q.number===n)!.reviewNote,/conferir no livro/);
});
test('SQLite carrega questões e metadados de revisão sem duplicar no seed',()=>{
  const db=openDatabase(':memory:');
  try{
    const count=db.prepare('SELECT COUNT(*) AS count FROM questions WHERE bank_version=?').get(BANK_VERSION) as {count:number};
    assert.equal(count.count,15);
    phases.forEach((p,i)=>assert.deepEqual(phaseQuestions(db,i).map(q=>q.id),p.questions.map(q=>q.id)));
    assert.deepEqual(db.pragma('foreign_key_check'),[]);
  }finally{db.close();}
});
test('patentes em todos os limites e estrelas',()=>{
  for(const [points,rank] of [[0,'Estagiário'],[59,'Estagiário'],[60,'Auditor Júnior'],[99,'Auditor Júnior'],[100,'Auditor Sênior'],[139,'Auditor Sênior'],[140,'Sócio'],[165,'Sócio']] as const) assert.equal(rankFor(points),rank);
  assert.deepEqual([0,1,2,3,4,5].map(starsFor),[0,0,0,1,2,3]);
});
