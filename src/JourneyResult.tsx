import { Star } from 'lucide-react';
import type { Phase, Save } from './api';

type Props = {
  phases: Phase[];
  progress: Save;
  busy: boolean;
  error: string;
  onReplay: () => void;
  onBack: () => void;
};
const shortTitles=['Execução','Carteira de clientes','Controle de qualidade'];

export function JourneyResult({phases,progress,busy,error,onReplay,onBack}: Props) {
  const finished=progress.results.every(Boolean);
  return <main className="journey-result-page">
    <section className="journey-result" aria-labelledby="journey-rank-title">
      <div className="journey-medal" aria-hidden="true"><Star size={40} fill="#F6CE00" strokeWidth={0}/></div>
      <p className="journey-result-caption">{finished?'Jogo concluído!':'Fase concluída!'} Sua patente:</p>
      <h1 id="journey-rank-title">{progress.rank}</h1>
      <p className="journey-result-score">{progress.total} de 165 pontos</p>
      <dl className="journey-result-summary">
        {phases.map((phase,i)=><div key={phase.id}><dt title={phase.title}>Fase {i+1} · {shortTitles[i]||phase.title}</dt><dd>{progress.results[i]?`${progress.results[i]!.correct} de 5`:'Pendente'}</dd></div>)}
      </dl>
      {error&&<p className="login-error" role="alert">{error}</p>}
      <div className="journey-result-actions"><button className="login-submit" disabled={busy} onClick={onReplay}>{busy?'Aguarde…':'Jogar novamente'}</button><button className="login-switch" disabled={busy} onClick={onBack}>Voltar ao mapa</button></div>
    </section>
  </main>;
}
