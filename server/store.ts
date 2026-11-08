import type Database from 'better-sqlite3';
import type { Client, Transaction, InValue } from '@libsql/client';
import { BANK_VERSION, phases } from './questions.js';
import type { StoredQuestion } from './db.js';

type Statement = {
  get: (...args: unknown[]) => Promise<unknown>;
  all: (...args: unknown[]) => Promise<unknown[]>;
  run: (...args: unknown[]) => Promise<unknown>;
};
export interface Store {
  prepare(sql: string): Statement;
  transaction<T>(fn: (tx: Store) => Promise<T>, mode?: 'write' | 'read'): () => Promise<T>;
  close(): void;
}
const localStores = new WeakMap<Database.Database, Store>();
function queue() {
  let tail = Promise.resolve();
  return <T>(operation: () => Promise<T>): Promise<T> => {
    const result = tail.then(operation);
    tail = result.then(() => {}, () => {});
    return result;
  };
}
export function asStore(input: Store | Database.Database): Store {
  if ('pragma' in input) {
    const cached = localStores.get(input);
    if (cached) return cached;
    const gate = queue();
    const direct: Store = {
      prepare(sql) {
        const statement = input.prepare(sql);
        return {
          get: async (...args) => statement.get(...args),
          all: async (...args) => statement.all(...args),
          run: async (...args) => statement.run(...args),
        };
      },
      transaction: () => { throw new Error('Transações aninhadas não são suportadas.'); },
      close: () => input.close(),
    };
    const store: Store = {
      ...direct,
      prepare(sql) {
        const statement = direct.prepare(sql);
        return {
          get: (...args) => gate(() => statement.get(...args)),
          all: (...args) => gate(() => statement.all(...args)),
          run: (...args) => gate(() => statement.run(...args)),
        };
      },
      transaction: (fn, mode='write') => () => gate(async () => {
        input.exec(mode==='write'?'BEGIN IMMEDIATE':'BEGIN');
        try { const result = await fn(direct); input.exec('COMMIT'); return result; }
        catch(error) { input.exec('ROLLBACK'); throw error; }
      }),
    };
    localStores.set(input, store);
    return store;
  }
  return input;
}

export function libsqlStore(client: Client): Store {
  const gate = queue();
  function direct(connection: Client | Transaction): Store {
    return {
      prepare(sql) {
        const execute = (args: unknown[]) => connection.execute({sql,args:args as InValue[]});
        return {
          get: async (...args) => (await execute(args)).rows[0],
          all: async (...args) => (await execute(args)).rows,
          run: async (...args) => execute(args),
        };
      },
      transaction: () => { throw new Error('Transações aninhadas não são suportadas.'); },
      close: () => connection.close(),
    };
  }
  const base = direct(client);
  return {
    ...base,
    prepare(sql) {
      const statement=base.prepare(sql);
      return {
        get:(...args)=>gate(()=>statement.get(...args)),
        all:(...args)=>gate(()=>statement.all(...args)),
        run:(...args)=>gate(()=>statement.run(...args)),
      };
    },
    transaction: (fn, mode='write') => () => gate(async () => {
      const tx = await client.transaction(mode);
      try { const result=await fn(direct(tx)); await tx.commit(); return result; }
      catch(error) { await tx.rollback(); throw error; }
      finally { tx.close(); }
    }),
  };
}

// Executed as one atomic batch: concurrent cold starts cannot observe half a schema.
export async function initializeLibsql(client: Client) {
  const version = Number((await client.execute('PRAGMA user_version')).rows[0]?.user_version || 0);
  if (version > 2) throw new Error('O banco exige uma versão mais recente do Contalingo.');
  if (version === 1) throw new Error('Migre o SQLite antigo localmente antes de importá-lo no Turso.');
  const schema = [
    'CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, matricula TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL)',
    "CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, phase INTEGER NOT NULL CHECK(phase BETWEEN 0 AND 2), question_order TEXT NOT NULL, answers TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, ended_at TEXT, correct INTEGER NOT NULL DEFAULT 0, score INTEGER NOT NULL DEFAULT 0, lives INTEGER NOT NULL DEFAULT 3, bank_version TEXT NOT NULL)",
    'CREATE TABLE IF NOT EXISTS results(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, phase INTEGER NOT NULL, correct INTEGER NOT NULL, score INTEGER NOT NULL, PRIMARY KEY(user_id,phase))',
    'CREATE TABLE IF NOT EXISTS questions(id TEXT PRIMARY KEY, phase INTEGER NOT NULL, position INTEGER NOT NULL, bank_version TEXT NOT NULL, payload TEXT NOT NULL, explanation TEXT NOT NULL, feedback_a TEXT, feedback_b TEXT, feedback_c TEXT, feedback_d TEXT, connection TEXT NOT NULL, review_status TEXT NOT NULL, review_note TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS responses(id TEXT PRIMARY KEY, attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE, question_id TEXT NOT NULL REFERENCES questions(id), position INTEGER NOT NULL, selected_option INTEGER NOT NULL CHECK(selected_option BETWEEN 0 AND 3), is_correct INTEGER NOT NULL CHECK(is_correct IN (0,1)), answered_at TEXT, UNIQUE(attempt_id,position))',
    'CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id)',
    'CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS responses_question ON responses(question_id)',
  ];
  await client.batch([
    ...schema,
    ...phases.flatMap((phase,p)=>phase.questions.map(q=>({
      sql:'INSERT OR IGNORE INTO questions(id,phase,position,bank_version,payload,explanation,feedback_a,feedback_b,feedback_c,feedback_d,connection,review_status,review_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      args:[q.id,p,q.number,BANK_VERSION,JSON.stringify({...q,phase:p,topic:phase.topic}),q.explanation,...q.feedback,q.connection,q.reviewStatus,q.reviewNote],
    }))),
    'PRAGMA user_version=2',
  ], 'write');
}

export async function connectDatabase(): Promise<Store> {
  const url=process.env.TURSO_DATABASE_URL;
  if(url) {
    if(!process.env.TURSO_AUTH_TOKEN) throw new Error('Configure TURSO_AUTH_TOKEN.');
    if(!/^(libsql|https):\/\//.test(url)) throw new Error('TURSO_DATABASE_URL deve usar libsql:// ou https://.');
    const {createClient}=await import('@libsql/client/web');
    const client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});
    try { await initializeLibsql(client); return libsqlStore(client); }
    catch(error) { client.close(); throw error; }
  }
  if(process.env.VERCEL) throw new Error('Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN na Vercel. SQLite local não é persistente nessa hospedagem.');
  const {openDatabase}=await import('./db.js');
  return asStore(openDatabase(process.env.DATABASE_PATH||'data/contalingo.sqlite'));
}
export async function storedQuestion(db:Store,id:string):Promise<StoredQuestion> {
  const row=await db.prepare('SELECT payload FROM questions WHERE id=?').get(id) as {payload:string}|undefined;
  if(!row)throw new Error('Pergunta não encontrada.');
  return JSON.parse(row.payload) as StoredQuestion;
}
export async function storedPhaseQuestions(db:Store,phase:number):Promise<StoredQuestion[]> {
  const rows=await db.prepare('SELECT payload FROM questions WHERE bank_version=? AND phase=? ORDER BY position').all(BANK_VERSION,phase) as {payload:string}[];
  return rows.map(row=>JSON.parse(row.payload) as StoredQuestion);
}
