export function rankFor(score: number) {
  return score >= 140 ? 'Sócio' : score >= 100 ? 'Auditor Sênior' : score >= 60 ? 'Auditor Júnior' : 'Estagiário';
}
export function starsFor(correct: number) { return Math.max(0, Math.min(3, correct - 2)); }
