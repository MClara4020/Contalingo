import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { BANK_VERSION, phases, type Question } from './questions.js';
import { phases as legacyPhases } from './legacy-questions.js';

export type StoredQuestion = Question & { phase: number; topic: string };
function insertQuestion(db: Database.Database, question: StoredQuestion, version: string) {
  db.prepare(`INSERT OR IGNORE INTO questions
    (id, phase, position, bank_version, payload, explanation, feedback_a, feedback_b, feedback_c, feedback_d, connection, review_status, review_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    question.id, question.phase, question.number, version, JSON.stringify(question), question.explanation,
    ...question.feedback, question.connection, question.reviewStatus, question.reviewNote,
  );
}
export function questionById(db: Database.Database, id: string): StoredQuestion {
  const row = db.prepare('SELECT payload FROM questions WHERE id=?').get(id) as { payload: string } | undefined;
  if (!row) throw new Error(`Pergunta não encontrada: ${id}`);
  return JSON.parse(row.payload) as StoredQuestion;
}
export function phaseQuestions(db: Database.Database, phase: number): StoredQuestion[] {
  const rows = db.prepare('SELECT payload FROM questions WHERE bank_version=? AND phase=? ORDER BY position').all(BANK_VERSION, phase) as {payload:string}[];
  return rows.map(row => JSON.parse(row.payload) as StoredQuestion);
}

export function openDatabase(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  try {
    const version = db.pragma('user_version', {simple:true}) as number;
    if (version > 2) throw new Error('O banco foi criado por uma versão mais recente do Contalingo.');
    db.transaction(() => {
      if (version === 0) {
        db.exec(`
          CREATE TABLE users(id TEXT PRIMARY KEY, name TEXT NOT NULL, matricula TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
          CREATE TABLE attempts(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, phase INTEGER NOT NULL CHECK(phase BETWEEN 0 AND 2), question_order TEXT NOT NULL, answers TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, ended_at TEXT, correct INTEGER NOT NULL DEFAULT 0, score INTEGER NOT NULL DEFAULT 0, lives INTEGER NOT NULL DEFAULT 3, bank_version TEXT NOT NULL);
          CREATE TABLE results(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, phase INTEGER NOT NULL, correct INTEGER NOT NULL, score INTEGER NOT NULL, PRIMARY KEY(user_id,phase));
        `);
      }
      if (version === 1) {
        db.exec(`
          ALTER TABLE users RENAME COLUMN email TO matricula;
          UPDATE users SET matricula=UPPER(matricula);
          ALTER TABLE attempts ADD COLUMN ended_at TEXT;
          ALTER TABLE attempts ADD COLUMN correct INTEGER NOT NULL DEFAULT 0;
          ALTER TABLE attempts ADD COLUMN score INTEGER NOT NULL DEFAULT 0;
          ALTER TABLE attempts ADD COLUMN lives INTEGER NOT NULL DEFAULT 3;
          ALTER TABLE attempts ADD COLUMN bank_version TEXT NOT NULL DEFAULT 'legacy';
        `);
      }
      db.exec(`
        CREATE TABLE IF NOT EXISTS questions(id TEXT PRIMARY KEY, phase INTEGER NOT NULL, position INTEGER NOT NULL, bank_version TEXT NOT NULL, payload TEXT NOT NULL, explanation TEXT NOT NULL, feedback_a TEXT, feedback_b TEXT, feedback_c TEXT, feedback_d TEXT, connection TEXT NOT NULL, review_status TEXT NOT NULL, review_note TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS responses(id TEXT PRIMARY KEY, attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE, question_id TEXT NOT NULL REFERENCES questions(id), position INTEGER NOT NULL, selected_option INTEGER NOT NULL CHECK(selected_option BETWEEN 0 AND 3), is_correct INTEGER NOT NULL CHECK(is_correct IN (0,1)), answered_at TEXT, UNIQUE(attempt_id,position));
        CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id);
        CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS responses_question ON responses(question_id);
      `);
      phases.forEach((phase, i) => phase.questions.forEach(question => insertQuestion(db, {...question, phase:i, topic:phase.topic}, BANK_VERSION)));
      if (version === 1) {
        const oldAttempts = db.prepare('SELECT * FROM attempts').all() as {id:string;phase:number;question_order:string;answers:string;status:string}[];
        if (oldAttempts.length) {
          legacyPhases.forEach((phase, p) => phase.questions.forEach((q, i) => insertQuestion(db, {
            ...q, id:`legacy-${p}-${i}`, number:i+1, title:`Questão anterior ${i+1}`, phase:p, topic:phase.topic,
            feedback:[null,null,null,null], connection:'', reference:`Conteúdo anterior: item ${phase.topic}`,
            source:'Versão anterior ao DOCX', reviewStatus:'legacy', reviewNote:'Conteúdo anterior, mantido apenas para preservar o histórico.', emphasizeNegation:false,
          }, 'legacy')));
        }
        for (const a of oldAttempts) {
          const order = (JSON.parse(a.question_order) as number[]).map(i => `legacy-${a.phase}-${i}`);
          const answers = JSON.parse(a.answers) as number[];
          let correct = 0;
          answers.forEach((option, i) => {
            const isCorrect = Number(questionById(db, order[i]).correct === option);
            correct += isCorrect;
            db.prepare('INSERT INTO responses(id,attempt_id,question_id,position,selected_option,is_correct) VALUES(?,?,?,?,?,?)')
              .run(`${a.id}-${i}`, a.id, order[i], i, option, isCorrect);
          });
          const lives = 3 - (answers.length - correct);
          const score = correct * 10 + Number(a.status === 'complete' && lives === 3) * 5;
          db.prepare('UPDATE attempts SET question_order=?,correct=?,score=?,lives=?,status=? WHERE id=?')
            .run(JSON.stringify(order),correct,score,lives,a.status === 'active' ? 'abandoned' : a.status,a.id);
        }
      }
      db.pragma('user_version = 2');
    })();
    if ((db.pragma('foreign_key_check') as unknown[]).length) throw new Error('Foram encontradas referências inválidas no banco.');
    return db;
  } catch (error) { db.close(); throw error; }
}
