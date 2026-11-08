import { Heart } from 'lucide-react';
import type { Phase } from './api';

type Props = {
  phase: Phase;
  phaseIndex: number;
  correct: number;
  busy: boolean;
  error: string;
  onRetry: () => void;
  onBack: () => void;
};
const tips = [
  'documentação, equipe adequada, especialistas e delegação.',
  'aceitação e retenção de clientes, análise de riscos, partes relacionadas e continuidade operacional.',
  'verificação anual por amostra, checklist de procedimentos e plano de ação para falhas.',
];

export function PhaseLost({phase,phaseIndex,correct,busy,error,onRetry,onBack}: Props) {
  return <main className="phase-lost-page">
    <section className="phase-lost" aria-labelledby="phase-lost-title">
      <div className="phase-lost-hearts" role="img" aria-label="Nenhuma vida restante">
        {[0,1,2].map(i=><Heart key={i} size={34} fill="currentColor" strokeWidth={0} aria-hidden="true"/>)}
      </div>
      <h1 id="phase-lost-title">Suas vidas acabaram</h1>
      <p className="phase-lost-subtitle">Você acertou {correct} de 5 na Fase {phaseIndex+1}.</p>
      <section className="phase-lost-tip" aria-labelledby="phase-lost-tip-title">
        <h2 id="phase-lost-tip-title">Dica</h2>
        <p>Revise o item {phase.topic} do livro: {tips[phaseIndex]} Na próxima tentativa, leia o cenário com atenção e use o que aprendeu com os feedbacks.</p>
      </section>
      {error&&<p className="login-error" role="alert">{error}</p>}
      <div className="phase-lost-actions">
        <button className="login-submit" disabled={busy} onClick={onRetry}>{busy?'Aguarde…':'Tentar novamente'}</button>
        <button className="login-switch" disabled={busy} onClick={onBack}>Voltar ao mapa</button>
      </div>
    </section>
  </main>;
}
