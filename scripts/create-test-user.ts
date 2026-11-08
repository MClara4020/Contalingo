import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { openDatabase } from '../server/db.js';

const scrypt=promisify(scryptCallback);
const matricula='TESTE';
const password='Contalingo123';
const db=openDatabase(process.env.DATABASE_PATH||'data/contalingo.sqlite');
try {
  const existing=db.prepare('SELECT password FROM users WHERE matricula=?').get(matricula) as {password:string}|undefined;
  if(existing){
    const [salt,hash]=existing.password.split(':');
    const supplied=await scrypt(password,salt,64) as Buffer;
    if(!timingSafeEqual(supplied,Buffer.from(hash,'hex'))) throw new Error('A matrícula TESTE já pertence a uma conta com outra senha. Nenhuma conta foi alterada.');
    console.log('Conta de teste já existe. Progresso preservado.');
  }else{
    const salt=randomBytes(16).toString('hex');
    const hash=(await scrypt(password,salt,64) as Buffer).toString('hex');
    db.prepare('INSERT INTO users(id,name,matricula,password) VALUES(?,?,?,?)').run(randomUUID(),'Aluno de Teste',matricula,`${salt}:${hash}`);
    console.log('Conta de teste criada com sucesso.');
  }
  console.log(`Matrícula: ${matricula}\nSenha: ${password}`);
}finally{db.close();}
