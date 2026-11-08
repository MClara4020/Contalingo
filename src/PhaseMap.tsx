import { LockKeyhole, Star } from 'lucide-react';
import type { Phase, Save } from './api';

type Props = {
  phases: Phase[];
  progress: Save;
  busy: boolean;
  error: string;
  onStart: (phase: number) => void;
  onExit: () => void;
  onResult: () => void;
};

export function PhaseMap({phases,progress,busy,error,onStart,onExit,onResult}: Props) {
  return <main className="phase-map-page">
    <section className="phase-map" aria-labelledby="phase-map-title">
      <div className="map-heading">
        <h1 id="phase-map-title">Escolha a fase</h1>
        <button className="map-exit" onClick={onExit} disabled={busy}>Sair</button>
      </div>
      <div className="map-overview" aria-label="Seu progresso">
        <div><span>Pontuação total</span><strong className="score map-score">{progress.total} pts</strong></div>
        <div><span>Patente atual</span><strong className="map-rank">{progress.rank}</strong></div>
      </div>
      <section className="map-instructions" aria-labelledby="map-help-title">
        <h2 id="map-help-title">Como jogar</h2>
        <ol><li>Leia o cenário</li><li>Escolha a melhor decisão</li><li>Aprenda com o feedback</li></ol>
        <p>3 vidas por fase · acerto +10 pts · erro −1 vida</p>
      </section>
      {error&&<p className="login-error" role="alert">{error}</p>}
      <div className="map-phase-list">
        {phases.map((phase,i)=>{
          const result=progress.results[i];
          const locked=i>0&&!progress.results[i-1];
          const stars=result?.stars??0;
          return <button key={phase.id} className={`phase-card map-phase${locked?' map-phase-locked':''}`} disabled={locked||busy} onClick={()=>onStart(i)} aria-label={`Fase ${i+1}: ${phase.title}. ${locked?'Bloqueada':`${stars} de 3 estrelas`}`}>
            <div className="map-phase-copy"><span className="map-phase-number">FASE {i+1}</span><h2>{phase.title}</h2><span className="map-phase-topic">Item {phase.topic} do livro</span></div>
            {locked?<LockKeyhole className="map-lock" size={21} fill="currentColor" aria-hidden="true"/>:<span className="map-stars" aria-hidden="true">{[0,1,2].map(star=><Star key={star} size={20} strokeWidth={0} fill={star<stars?'#F4C400':'#D4D9E5'}/>)}</span>}
          </button>;
        })}
      </div>
      {progress.results.every(Boolean)&&<button className="login-submit map-result" disabled={busy} onClick={onResult}>Ver meu resultado</button>}
      {busy&&<p className="map-status" role="status">Aguarde…</p>}
    </section>
  </main>;
}
