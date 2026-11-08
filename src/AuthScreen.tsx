import type { FormEvent } from 'react';
import { FileSearch } from 'lucide-react';

type Props = {
  register: boolean;
  name: string;
  matricula: string;
  password: string;
  busy: boolean;
  error: string;
  onName: (value: string) => void;
  onMatricula: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggle: () => void;
};

function AuditIllustration() {
  return <svg className="login-illustration" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="58" r="51" fill="#E9ECF5"/>
    <rect x="31" y="24" width="48" height="66" rx="7" fill="white" stroke="#25366A" strokeWidth="2"/>
    <path d="M40 37H69M40 47H69M40 57H61M40 67H57" stroke="#D5DCEB" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="77" cy="70" r="16" fill="white" fillOpacity=".65" stroke="#25366A" strokeWidth="4"/>
    <path d="M89 83L103 98" stroke="#25366A" strokeWidth="6" strokeLinecap="round"/>
    <path d="M90 29L92 35L98 37L92 39L90 45L88 39L82 37L88 35L90 29Z" fill="#F2C94C"/>
  </svg>;
}

export function AuthScreen(props: Props) {
  const {register,name,matricula,password,busy,error,onName,onMatricula,onPassword,onSubmit,onToggle} = props;
  return <main className="login-page">
    <section className={`login-panel${register?' register-panel':''}`} aria-labelledby="login-title">
      {register?<div className="register-intro">
        <h1 id="login-title">Criar conta</h1>
        <p>Preencha seus dados para começar a jogar.</p>
      </div>:<div className="login-intro">
        <AuditIllustration/>
        <h1 id="login-title"><FileSearch size={25} strokeWidth={1.8}/> Contalingo</h1>
        <p>Você é o novo auditor da firma. Entre para jogar.</p>
      </div>}
      <form className="login-form" onSubmit={onSubmit} aria-label={register?'Cadastro':'Login'}>
        {register&&<div className="login-field"><label htmlFor="auth-name">Nome completo</label><input id="auth-name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Digite seu nome" value={name} onChange={e=>onName(e.target.value)} disabled={busy}/></div>}
        <div className="login-field"><label htmlFor="matricula">Matrícula</label><input id="matricula" required maxLength={register?40:254} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Digite sua matrícula" value={matricula} onChange={e=>onMatricula(e.target.value)} disabled={busy}/></div>
        <div className="login-field"><label htmlFor="password">Senha</label><input id="password" type="password" required minLength={8} maxLength={128} autoComplete={register?'new-password':'current-password'} title={register?'Use entre 8 e 128 caracteres.':undefined} placeholder={register?'Crie uma senha':'Digite sua senha'} value={password} onChange={e=>onPassword(e.target.value)} disabled={busy}/></div>
        
        {error&&<p className="login-error" role="alert">{error}</p>}
        <div className="login-actions">
          <button disabled={busy} className="login-submit" type="submit">{busy?'Aguarde…':register?'Criar conta':'Entrar'}</button>
          <button disabled={busy} className="login-switch" type="button" onClick={onToggle}>{register?'Já tenho conta':'Criar conta'}</button>
        </div>
      </form>
      {!register&&<p className="login-help">Esqueceu a senha? Fale com o grupo do projeto.</p>}
    </section>
  </main>;
}
