import type { Request, Response } from 'express';
import { createApp } from '../server/app.js';
import { connectDatabase, type Store } from '../server/store.js';

export function createVercelHandler(connect: () => Promise<Store> = connectDatabase) {
  let application: Promise<ReturnType<typeof createApp>> | undefined;
  function getApplication() {
    application ??= connect().then(db => createApp(db, {
      production: true,
      origin: process.env.APP_ORIGIN,
      trustProxy: true,
    })).catch(error => { application=undefined; throw error; });
    return application;
  }
  return async function handler(req: Request, res: Response) {
    try {
      const url = new URL(req.url || '/', 'https://contalingo.invalid');
      const route = url.searchParams.get('__route') ?? req.query?.__route;
      if (typeof route === 'string') {
        url.pathname = `/api/${route}`;
        url.searchParams.delete('__route');
        req.url = url.pathname + url.search;
      }
      const app = await getApplication();
      // Keep the invocation alive until Express finishes its asynchronous queries.
      await new Promise<void>((resolve, reject) => {
        const finish = () => { res.off('finish',finish); res.off('close',finish); resolve(); };
        res.once('finish', finish);
        res.once('close', finish);
        try { app(req,res); } catch(error) { reject(error); }
      });
    } catch(error) {
      console.error('Falha ao conectar o banco do Contalingo:',error instanceof Error?error.message:'Erro desconhecido');
      if (!res.headersSent) {
        res.statusCode=503;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({error:'Banco indisponível. Confira DATABASE_URL ou TURSO_DATABASE_URL e TURSO_AUTH_TOKEN na configuração da hospedagem.'}));
      }
    }
  };
}
// Vercel owns the HTTP server; there is no listen() or local SQLite file here.
export default createVercelHandler();
