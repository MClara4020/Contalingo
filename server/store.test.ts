import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { initializeLibsql, libsqlStore, connectDatabase } from './store.js';

test('libSQL inicializa banco vazio, faz rollback e preserva dados entre conexões',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'contalingo-libsql-'));const url=`file:${join(dir,'remote.sqlite')}`;
 let client=createClient({url});
 try{
  await initializeLibsql(client);await initializeLibsql(client);
  const db=libsqlStore(client);
  assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM questions').get() as {count:number}).count,15);
  await assert.rejects(db.transaction(async tx=>{
    await tx.prepare('INSERT INTO users(id,name,matricula,password) VALUES(?,?,?,?)').run('rollback','Teste','R','hash');
    throw new Error('rollback');
  })(),/rollback/);
  assert.equal(await db.prepare("SELECT * FROM users WHERE id='rollback'").get(),undefined);
  await db.prepare('INSERT INTO users(id,name,matricula,password) VALUES(?,?,?,?)').run('saved','Aluno','00123','hash');
  client.close();client=createClient({url});
  await initializeLibsql(client);
  assert.equal((await libsqlStore(client).prepare("SELECT matricula FROM users WHERE id='saved'").get() as {matricula:string}).matricula,'00123');
 }finally{client.close();rmSync(dir,{recursive:true,force:true});}
});

test('Vercel não cria banco temporário se faltarem as credenciais remotas',async()=>{
 const previous={VERCEL:process.env.VERCEL,TURSO_DATABASE_URL:process.env.TURSO_DATABASE_URL};
 process.env.VERCEL='1';delete process.env.TURSO_DATABASE_URL;
 try{await assert.rejects(connectDatabase(),/TURSO_DATABASE_URL/);}
 finally{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
