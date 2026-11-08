import { createApp } from './app.js';
import { connectDatabase } from './store.js';
import express from 'express';
import { resolve } from 'node:path';
const production=process.env.NODE_ENV==='production';
const db=await connectDatabase();
const app=createApp(db,{production,origin:process.env.APP_ORIGIN});
if(production){app.use(express.static(resolve('dist')));app.get('*',(_req,res)=>res.sendFile(resolve('dist/index.html')));}
const port=Number(process.env.PORT||3001);
const server=app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Contalingo API: http://${process.env.HOST||'127.0.0.1'}:${port}`));
function shutdown(){server.close(()=>{db.close();process.exit(0);});}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
