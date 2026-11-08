import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { openDatabase } from './db.js';

test('comando gera XLSX legível com matrículas de texto e sem segredos',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'contalingo-report-'));
 try{
  const path=join(directory,'database.sqlite');const output=join(directory,'turma.xlsx');
  const db=openDatabase(path);
  db.prepare('INSERT INTO users(id,name,matricula,password) VALUES(?,?,?,?)').run('u','=Nome de teste','00123','hash-privado');
  db.prepare('INSERT INTO results(user_id,phase,correct,score) VALUES(?,?,?,?)').run('u',0,4,40);
  db.close();
  const log=execFileSync(process.execPath,['--import','tsx','scripts/export-report.ts','--output',output],{env:{...process.env,DATABASE_PATH:path},encoding:'utf8'});
  assert.match(log,/Planilha gerada/);
  const workbook=new ExcelJS.Workbook();await workbook.xlsx.readFile(output);
  assert.equal(workbook.worksheets.length,5);
  const students=workbook.getWorksheet('Alunos')!;
  assert.equal(students.getCell('A2').value,'=Nome de teste');
  assert.equal(students.getCell('A2').type,ExcelJS.ValueType.String);
  assert.equal(students.getCell('B2').value,'00123');
  assert.equal(students.getCell('C2').value,40);
  assert.ok(!JSON.stringify(workbook.model).includes('hash-privado'));
 }finally{rmSync(directory,{recursive:true,force:true});}
});
