import { test } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase, questionById } from './db.js';
import { phases as legacy } from './legacy-questions.js';

test('migração preserva usuários, sessões, pontuação e respostas anteriores sem reinterpretar o gabarito',()=>{
 const dir=mkdtempSync(join(tmpdir(),'contalingo-migration-'));const path=join(dir,'legacy.sqlite');
 let db=new Database(path);
 try{
  db.exec(`
   CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
   CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires INTEGER);
   CREATE TABLE attempts(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),phase INTEGER,question_order TEXT,answers TEXT,status TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
   CREATE TABLE results(user_id TEXT REFERENCES users(id),phase INTEGER,correct INTEGER,score INTEGER,PRIMARY KEY(user_id,phase));
   INSERT INTO users(id,name,email,password) VALUES('u','Aluno Antigo','aluno@example.com','hash-antigo');
   INSERT INTO sessions VALUES('token','u',9999999999999);
   INSERT INTO attempts(id,user_id,phase,question_order,answers,status) VALUES('a','u',0,'[0,1,2,3,4]','[1,2,0,3,1]','complete');
   INSERT INTO attempts(id,user_id,phase,question_order,answers,status) VALUES('active','u',0,'[0,1,2,3,4]','[0]','active');
   INSERT INTO results VALUES('u',0,5,55);
   PRAGMA user_version=1;
  `);
  db.close();db=openDatabase(path);
  const user=db.prepare('SELECT * FROM users').get() as {matricula:string;password:string};
  assert.equal(user.matricula,'ALUNO@EXAMPLE.COM');assert.equal(user.password,'hash-antigo');
  assert.equal((db.prepare('SELECT score FROM results').get() as {score:number}).score,55);
  assert.equal((db.prepare('SELECT COUNT(*) AS count FROM sessions').get() as {count:number}).count,1);
  const a=db.prepare("SELECT * FROM attempts WHERE id='a'").get() as {question_order:string;correct:number;score:number;ended_at:string|null};
  assert.equal(a.correct,5);assert.equal(a.score,55);assert.equal(a.ended_at,null);
  const first=questionById(db,JSON.parse(a.question_order)[0]);
  assert.equal(first.correct,legacy[0].questions[0].correct);
  assert.notEqual(first.correct,2); // Novo P1 tem C; a pergunta antiga tinha B.
  assert.equal((db.prepare('SELECT COUNT(*) AS count FROM responses').get() as {count:number}).count,6);
  assert.equal((db.prepare("SELECT status FROM attempts WHERE id='active'").get() as {status:string}).status,'abandoned');
  assert.deepEqual(db.pragma('foreign_key_check'),[]);
  db.close();db=openDatabase(path);
  assert.equal((db.prepare('SELECT COUNT(*) AS count FROM responses').get() as {count:number}).count,6);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
