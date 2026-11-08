import { Star } from 'lucide-react';
import type { Phase } from './api';

type Props = {
  phase: Phase;
  phaseIndex: number;
  correct: number;
  score: number;
  busy: boolean;
  error: string;
  onContinue: () => void;
};

export function PhaseComplete({phase,phaseIndex,correct,score,busy,error,onContinue}: Props) {
  const stars=Math.max(0,Math.min(3,correct-2));
  const basePoints=correct*10;
  const bonus=score-basePoints;
  return <main className="phase-complete-page">
    <section className="phase-complete" aria-labelledby="phase-complete-title">
      <div className="phase-complete-stars" role="img" aria-label={`${stars} de 3 estrelas`}>
        {[0,1,2].map(i=><Star key={i} size={34} fill={i<stars?'#F3C500':'#D5DAE5'} strokeWidth={0} aria-hidden="true"/>)}
      </div>
      <h1 id="phase-complete-title">Fase concluída!</h1>
      <p className="phase-complete-subtitle">Fase {phaseIndex+1} – {phase.title}</p>
      <dl className="phase-complete-summary">
        <div><dt>Acertos</dt><dd>{correct} de 5</dd></div>
        <div><dt>Pontos da fase</dt><dd>{basePoints}</dd></div>
        <div><dt>Bônus sem erros</dt><dd>+{bonus}</dd></div>
        <div className="phase-complete-total"><dt>Total da fase</dt><dd>{score} pts</dd></div>
      </dl>
      {error&&<p className="login-error" role="alert">{error}</p>}
      <button className="login-submit phase-complete-continue" disabled={busy} onClick={onContinue}>{busy?'Aguarde…':'Continuar'}</button>
    </section>
  </main>;
}
