export type Result = {correct:number;score:number;stars:number};
export type Save = {name:string;matricula:string;total:number;rank:string;results:(Result|null)[]};
export type Question = {id?:string;title?:string;scenario:string;question:string;options:string[];emphasizeNegation?:boolean;correct?:number;explanation?:string;selectedExplanation?:string|null;connection?:string;reference?:string;topic?:string};
export type Phase = {id:number;title:string;topic:string;description:string;tag:string;intro:string;questionCount:number};
export type Attempt = {id:string;phase:number;index:number;correct:number;lives:number;score:number;status:string;question:Question|null};
export type AnswerResponse = {attempt:Attempt;feedback:Required<Pick<Question,'correct'|'explanation'|'selectedExplanation'|'connection'|'reference'|'topic'>>;progress:Save};
export class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
export async function api<T>(path:string,method='GET',data?:unknown):Promise<T>{
 const response=await fetch('/api'+path,{method,credentials:'same-origin',headers:method==='GET'?{}:{'Content-Type':'application/json'},body:method==='GET'?undefined:JSON.stringify(data??{})});
 const result=await response.json().catch(()=>({error:'O servidor retornou uma resposta inválida.'}));
 if(!response.ok)throw new ApiError(response.status,result.error||'Não foi possível concluir a operação.');return result as T;
}
