import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Request, Response } from 'express';
import { createClient } from '@libsql/client';
import { createVercelHandler } from '../api/index.js';
import { initializeLibsql, libsqlStore } from './store.js';

test('handler da Vercel encaminha caminhos, mantém sessão HTTPS e aguarda as respostas',async()=>{
  const client=createClient({url:':memory:'});
  await initializeLibsql(client);
  let initializations=0;
  const handler=createVercelHandler(async()=>{initializations++;return libsqlStore(client);});
  const server=createServer((req,res)=>void handler(req as Request,res as Response));
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const health=await fetch(`${base}/api/index?__route=health`);
    assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});
    const register=await fetch(`${base}/api/index?__route=auth/register`,{
      method:'POST',headers:{'Content-Type':'application/json','Origin':base.replace('http:','https:'),'X-Forwarded-Proto':'https'},
      body:JSON.stringify({name:'Teste Vercel',matricula:'VERCEL-01',password:'senha-de-teste'}),
    });
    assert.equal(register.status,201);
    const session=register.headers.get('set-cookie')!;
    assert.match(session,/HttpOnly/);assert.match(session,/Secure/);
    const me=await fetch(`${base}/api/index?__route=me`,{headers:{Cookie:session.split(';')[0]}});
    assert.equal(me.status,200);assert.equal((await me.json() as {matricula:string}).matricula,'VERCEL-01');
    const attempt=await fetch(`${base}/api/index?__route=attempts`,{method:'POST',headers:{Cookie:session.split(';')[0],'Content-Type':'application/json'},body:JSON.stringify({phase:0})});
    assert.equal(attempt.status,201);assert.equal(initializations,1);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));client.close();}
});
