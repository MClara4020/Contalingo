import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type Database from 'better-sqlite3';
import { BANK_VERSION, phases } from './questions.js';
import { asStore, storedPhaseQuestions, storedQuestion, type Store } from './store.js';
import { rankFor, starsFor } from './game.js';
const scrypt = promisify(scryptCallback);
type User = {id:string; name:string; matricula:string; password:string};
type Attempt = {id:string;user_id:string;phase:number;question_order:string;answers:string;status:string;correct:number;score:number;lives:number};
class ApiError extends Error { constructor(public status:number, message:string){super(message);} }
const fail = (status:number,message:string):never=>{throw new ApiError(status,message);};
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');
async function passwordHash(password:string) { const salt=randomBytes(16).toString('hex'); return salt+':'+(await scrypt(password,salt,64) as Buffer).toString('hex'); }
async function passwordMatches(password:string,stored:string) {const [salt,hash]=stored.split(':');const supplied=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(supplied,Buffer.from(hash,'hex'));}
export function createApp(input:Database.Database|Store, options:{production?:boolean;origin?:string;trustProxy?:boolean}={}) {
 const db=asStore(input);
 const app=express(); app.disable('x-powered-by');
 if(options.trustProxy)app.set('trust proxy',1);
 app.use(helmet({contentSecurityPolicy:{directives:{'font-src':["'self'",'https://fonts.gstatic.com'],'style-src':["'self'","'unsafe-inline'",'https://fonts.googleapis.com']}}}));
 app.use(express.json({limit:'16kb'}));app.use(cookieParser());
 app.use('/api',rateLimit({windowMs:60_000,limit:180,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Muitas solicitações. Aguarde um minuto.'}}));
 app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');if(!['GET','HEAD','OPTIONS'].includes(req.method)){
 const origin=req.get('origin'); const expected=options.origin || `${req.protocol}://${req.get('host')}`;
 if((origin && origin!==expected) || req.get('sec-fetch-site')==='cross-site') {res.status(403).json({error:'Origem não permitida.'});return;}
 if(!req.is('application/json')) {res.status(415).json({error:'Envie dados em JSON.'});return;}
 } next();});
 const authLimit=rateLimit({windowMs:15*60_000,limit:30,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Muitas tentativas. Aguarde 15 minutos.'}});
 const route=(fn:(req:Request,res:Response)=>unknown)=> (req:Request,res:Response,next:NextFunction)=>{Promise.resolve().then(()=>fn(req,res)).catch(next);};
 async function user(req:Request):Promise<User> {const row=await db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(hashToken(req.cookies.session||''),Date.now()) as User|undefined;return row||fail(401,'Entre na sua conta para continuar.');}
 async function progress(u:User, db:Store=asStore(input)) {
   const rows = await db.prepare('SELECT phase, correct, score FROM results WHERE user_id=?').all(u.id) as {phase:number;correct:number;score:number}[];
   const total = rows.reduce((sum,r) => sum+r.score,0);
   return {name:u.name,matricula:u.matricula,total,rank:rankFor(total),results:phases.map((_,i)=>{
     const r=rows.find(r=>r.phase===i);return r?{correct:r.correct,score:r.score,stars:starsFor(r.correct)}:null;
   })};
 }
 async function session(res:Response,u:User, db:Store=asStore(input)){const token=randomBytes(32).toString('hex');const expires=Date.now()+7*24*60*60_000;await db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());await db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hashToken(token),u.id,expires);res.cookie('session',token,{httpOnly:true,sameSite:'lax',secure:!!options.production,maxAge:7*24*60*60_000,path:'/'});}
 function credentials(req:Request, registering=false) {
   const {matricula,password}=req.body||{};
   if(typeof matricula!=='string'||!matricula.trim()||matricula.trim().length>254||/\s/.test(matricula.trim())) fail(400,'Informe uma matrícula válida.');
   const normalized=(matricula as string).trim().toUpperCase();
   if(registering && !/^[A-Z0-9][A-Z0-9._/-]{0,39}$/.test(normalized)) fail(400,'Use até 40 letras, números, pontos, barras ou hífens na matrícula.');
   if(typeof password!=='string'||password.length<8||password.length>128) fail(400,'A senha deve ter entre 8 e 128 caracteres.');
   return {matricula:normalized,password:password as string};
 }
 function validName(value:unknown) {
   if(typeof value!=='string'||value.trim().length<2||value.trim().length>120) fail(400,'Informe um nome entre 2 e 120 caracteres.');
   return (value as string).trim();
 }
 app.get('/api/health',route(async(_req,res)=>{await db.prepare('SELECT 1').get();res.json({status:'ok'});}));
 app.post('/api/auth/register',authLimit,route(async(req,res)=>{
   const {matricula,password}=credentials(req,true);const name=validName(req.body.name);
   const hash=await passwordHash(password);
   const u={id:randomUUID(),name,matricula,password:hash};
   await db.transaction(async(db)=>{
     if(await db.prepare('SELECT id FROM users WHERE matricula=?').get(matricula)) fail(409,'Esta matrícula já está cadastrada.');
     await db.prepare('INSERT INTO users(id,name,matricula,password) VALUES(?,?,?,?)').run(u.id,name,matricula,hash);
     await session(res,u,db);
   })();
   res.status(201).json(await progress(u));
 }));
 app.post('/api/auth/login',authLimit,route(async(req,res)=>{
   const {matricula,password}=credentials(req);
   const u=await db.prepare('SELECT * FROM users WHERE matricula=?').get(matricula) as User|undefined;
   const fallback='00000000000000000000000000000000:'+ '00'.repeat(64);
   const matches=await passwordMatches(password,u?.password||fallback);
   if(!u||!matches) fail(401,'Matrícula ou senha incorretas.');
   await session(res,u!);res.json(await progress(u!));
 }));
 app.post('/api/auth/logout',route(async(req,res)=>{await db.prepare('DELETE FROM sessions WHERE token=?').run(hashToken(req.cookies.session||''));res.clearCookie('session',{path:'/',httpOnly:true,sameSite:'lax',secure:!!options.production});res.json({ok:true});}));
 app.get('/api/me',route(async(req,res)=>res.json(await progress(await user(req)))));
 app.patch('/api/me',route(async(req,res)=>{const u=await user(req);const name=validName(req.body.name);await db.prepare('UPDATE users SET name=? WHERE id=?').run(name,u.id);res.json(await progress({...u,name}));}));
 // Recomeçar zera a pontuação atual, mas preserva o histórico usado pela professora.
 app.delete('/api/me/progress',route(async(req,res)=>{
   const u=await user(req);
   await db.transaction(async(db)=>{
     await db.prepare('DELETE FROM results WHERE user_id=?').run(u.id);
     await db.prepare("UPDATE attempts SET status='abandoned',ended_at=? WHERE user_id=? AND status='active'").run(new Date().toISOString(),u.id);
   })();
   res.json(await progress(u));
 }));
 app.get('/api/phases',route((_req,res)=>res.json(phases.map(({questions,...p},id)=>({...p,id,questionCount:questions.length})))));
 async function view(a:Attempt, db:Store=asStore(input)) {
   const order=JSON.parse(a.question_order) as string[];
   const count=(await db.prepare('SELECT COUNT(*) AS count FROM responses WHERE attempt_id=?').get(a.id) as {count:number}).count;
   const q=a.status==='active'?await storedQuestion(db,order[count]):null;
   return {id:a.id,phase:a.phase,index:count,correct:a.correct,lives:a.lives,score:a.score,status:a.status,
     question:q?{id:q.id,title:q.title,scenario:q.scenario,question:q.question,options:q.options,emphasizeNegation:q.emphasizeNegation}:null};
 }
 app.post('/api/attempts',route(async(req,res)=>{
   const u=await user(req);const p=req.body.phase;
   if(!Number.isInteger(p)||p<0||p>=phases.length) fail(400,'Fase inválida.');
   if(p>0&&!(await db.prepare('SELECT 1 FROM results WHERE user_id=? AND phase=?').get(u.id,p-1))) fail(403,'Conclua a fase anterior para continuar.');
   // A ordem é narrativa: a ligação de cada feedback prepara a pergunta seguinte.
   const order=(await storedPhaseQuestions(db,p)).map(q=>q.id);
   const a:Attempt={id:randomUUID(),user_id:u.id,phase:p,question_order:JSON.stringify(order),answers:'[]',status:'active',correct:0,score:0,lives:3};
   const now=new Date().toISOString();
   await db.transaction(async(db)=>{
     await db.prepare("UPDATE attempts SET status='abandoned',ended_at=? WHERE user_id=? AND status='active'").run(now,u.id);
     await db.prepare('INSERT INTO attempts(id,user_id,phase,question_order,created_at,bank_version) VALUES(?,?,?,?,?,?)').run(a.id,u.id,p,a.question_order,now,BANK_VERSION);
   })();
   res.status(201).json(await view(a));
 }));
 app.get('/api/attempts/:id',route(async(req,res)=>{
   const u=await user(req);
   const a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').get(req.params.id,u.id) as Attempt|undefined;
   if(!a) fail(404,'Tentativa não encontrada.');
   res.json(await view(a!));
 }));
 app.post('/api/attempts/:id/answers',route(async(req,res)=>{
   const u=await user(req);const {option,index}=req.body;
   if(!Number.isInteger(option)||option<0||option>3||!Number.isInteger(index)) fail(400,'Resposta inválida.');
   const response=await db.transaction(async(db)=>{
     const a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').get(req.params.id,u.id) as Attempt|undefined;
     if(!a) fail(404,'Tentativa não encontrada.');
     if(a!.status!=='active') fail(409,'Esta tentativa já foi encerrada.');
     const before=await view(a!,db);
     if(index!==before.index) fail(409,'Esta pergunta já foi respondida ou está fora de ordem.');
     const q=await storedQuestion(db,(JSON.parse(a!.question_order) as string[])[index]);
     const isCorrect=option===q.correct;
     const answers=JSON.parse(a!.answers) as number[];answers.push(option);
     a!.answers=JSON.stringify(answers);a!.lives-=Number(!isCorrect);a!.correct+=Number(isCorrect);
     a!.status=a!.lives===0?'lost':answers.length===5?'complete':'active';
     a!.score=a!.correct*10+Number(a!.status==='complete'&&a!.lives===3)*5;
     const now=new Date().toISOString();
     await db.prepare('INSERT INTO responses(id,attempt_id,question_id,position,selected_option,is_correct,answered_at) VALUES(?,?,?,?,?,?,?)')
       .run(randomUUID(),a!.id,q.id,index,option,Number(isCorrect),now);
     await db.prepare('UPDATE attempts SET answers=?,status=?,correct=?,score=?,lives=?,ended_at=? WHERE id=?')
       .run(a!.answers,a!.status,a!.correct,a!.score,a!.lives,a!.status==='active'?null:now,a!.id);
     if(a!.status==='complete') {
       await db.prepare('INSERT INTO results(user_id,phase,correct,score) VALUES(?,?,?,?) ON CONFLICT(user_id,phase) DO UPDATE SET correct=excluded.correct,score=excluded.score WHERE excluded.score>results.score')
         .run(u.id,a!.phase,a!.correct,a!.score);
     }
     return {attempt:await view(a!,db),feedback:{correct:q.correct,explanation:q.explanation,isCorrect,
       selectedExplanation:isCorrect?null:q.feedback[option],connection:q.connection,reference:q.reference,topic:q.topic},progress:await progress(u,db)};
   })();
   res.json(response);
 }));
 app.use('/api',(_req,res)=>res.status(404).json({error:'Rota não encontrada.'}));
 app.use((error:unknown,_req:Request,res:Response,_next:NextFunction)=>{if(error instanceof ApiError){res.status(error.status).json({error:error.message});return;}if(error instanceof SyntaxError){res.status(400).json({error:'JSON inválido.'});return;}if((error as {type?:string})?.type==='entity.too.large'){res.status(413).json({error:'Dados excedem o limite permitido.'});return;}console.error(error);res.status(500).json({error:'Não foi possível concluir a operação.'});});
 return app;
}
