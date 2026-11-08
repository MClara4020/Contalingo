import { ArrowLeft, Check, CheckCircle2, Heart, X } from 'lucide-react';
import type { Question } from './api';

type Props = {
  question: Question;
  index: number;
  lives: number;
  correct: number;
  selected: number | null;
  busy: boolean;
  error: string;
  onAnswer: (option: number) => void;
  onNext: () => void;
  onBack: () => void;
};

export function QuizScreen({question:q,index,lives,correct,selected,busy,error,onAnswer,onNext,onBack}: Props) {
  const answered=selected!==null;
  const isCorrect=selected===q.correct;
  return <main className="quiz-page">
    <section className="quiz-panel" aria-labelledby="quiz-title">
      <h1 id="quiz-title" className="sr-only">{q.title || 'Pergunta de auditoria'}</h1>
      <div className="quiz-topbar">
        <div className="quiz-progress-group"><span>Pergunta {index+1} de 5</span><div className="quiz-progress-bar" role="progressbar" aria-label="Progresso da fase" aria-valuemin={0} aria-valuemax={5} aria-valuenow={index+1}><i style={{width:`${(index+1)*20}%`}}/></div></div>
        <div className="quiz-lives" aria-label={`${lives} vidas restantes`}>{[0,1,2].map(i=><Heart key={i} size={20} fill="currentColor" strokeWidth={0} className={i<lives?'quiz-heart-active':''} aria-hidden="true"/>)}</div>
        <span className="quiz-points" aria-label={`${correct*10} pontos`}>{correct*10} pts</span>
      </div>
      <div className="quiz-scenario">
        <div className="scenario-label">CENÁRIO<span className="sr-only"> · {q.title}</span></div>
        <p>{q.scenario} <span>{q.emphasizeNegation?q.question.split(/(não)/i).map((part,i)=>part.toLowerCase()==='não'?<strong className="negation" key={i}>{part.toUpperCase()}</strong>:part):q.question}</span></p>
      </div>
      <div className="answers quiz-answers" aria-label="Alternativas">
        {q.options.map((option,i)=><button key={`${q.id}-${i}`} disabled={answered||busy} onClick={()=>onAnswer(i)} className={`answer quiz-answer${answered&&i===q.correct?' right':''}${selected===i&&i!==q.correct?' wrong':''}`}><span className="letter">{'ABCD'[i]}</span><span>{option}</span>{answered&&i===q.correct&&<Check size={19} aria-label="Resposta correta"/>}{selected===i&&i!==q.correct&&<X size={19} aria-label="Resposta incorreta"/>}</button>)}
      </div>
      {error&&<p className="login-error" role="alert">{error}</p>}
      {answered&&<>
        <div className="feedback quiz-feedback" role="status">
          <div className={`quiz-feedback-banner ${isCorrect?'is-correct':'is-incorrect'}`}>
            {isCorrect?<CheckCircle2 size={21} aria-hidden="true"/>:<X size={21} aria-hidden="true"/>}
            <div><b>{isCorrect?'Correto! +10 pontos':'Incorreto'}</b><span>{isCorrect?'Boa decisão!':`Resposta correta: ${'ABCD'[q.correct!]}`}</span></div>
          </div>
          <div className="feedback-scroll quiz-feedback-details" tabIndex={0} aria-label="Explicação da resposta">
            <p><strong>Por que a {'ABCD'[q.correct!]} está certa:</strong> {q.explanation}</p>
            {!isCorrect&&<p className="feedback-mistake"><strong>Por que a sua está errada:</strong> {q.selectedExplanation}</p>}
            <p className="feedback-connection"><strong>Próximo passo:</strong> {q.connection}</p>
            <div className="quiz-feedback-reference"><small>{q.reference}</small><small>Conteúdo: item {q.topic}</small></div>
          </div>
        </div>
        <button className="login-submit quiz-next" disabled={busy} onClick={onNext}>{lives===0?'Ver resultado':index===4?'Concluir fase':'Próxima'}</button>
      </>}
      {busy&&<p className="quiz-status" role="status">Registrando sua decisão…</p>}
      <button className="quiz-back" disabled={busy} onClick={onBack}><ArrowLeft size={14}/> Voltar à jornada</button>
    </section>
  </main>;
}
