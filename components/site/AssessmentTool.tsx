'use client';

import { useMemo, useState } from 'react';

type HarnessPrompt = { n: number; name: string; q: string; phase: number; plane: string };
const levels = ['Not started', 'Piloted', 'In production', 'Governed'];

export function AssessmentTool({ harnesses }: { harnesses: HarnessPrompt[] }) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const completed = Object.keys(scores).length;
  const weakest = useMemo(() => harnesses.filter((h) => scores[h.n] !== undefined).sort((a, b) => scores[a.n] - scores[b.n] || a.phase - b.phase).slice(0, 3), [harnesses, scores]);
  const recommendedPhase = weakest.length ? Math.min(...weakest.map((h) => h.phase)) : 0;
  const [tasks, setTasks] = useState(500);
  const [steps, setSteps] = useState(12);
  const [rate, setRate] = useState(0.006);
  const [multi, setMulti] = useState(false);
  const cost = tasks * steps * rate * (multi ? 15 : 1);

  return <>
    <section className="assessment-shell section-shell" aria-labelledby="assessment-title">
      <header><div><span>PROGRESS</span><strong>{completed} / 16</strong></div><div className="assessment-progress"><span style={{ width: `${completed / 16 * 100}%` }} /></div></header>
      <div className="assessment-questions">
        {harnesses.map((harness) => <fieldset key={harness.n} className={`assessment-question plane-${harness.plane}`}>
          <legend><span>{String(harness.n).padStart(2, '0')}</span><b>{harness.name}</b><small>{harness.q}</small></legend>
          <div>{levels.map((level, index) => <label key={level}><input type="radio" name={`harness-${harness.n}`} checked={scores[harness.n] === index} onChange={() => setScores((current) => ({ ...current, [harness.n]: index }))} /><span>{level}</span></label>)}</div>
        </fieldset>)}
      </div>
      <aside className="assessment-result">
        <div className="section-number">CURRENT READING</div>
        {completed === 0 ? <><h2>Start with what is true today.</h2><p>The result updates in memory as you answer. Nothing is sent or stored.</p></> : <><h2>{completed === 16 ? 'Your weakest boundaries are visible.' : `${16 - completed} boundaries remain.`}</h2><p>Recommended next focus: <b>Phase {recommendedPhase}</b>.</p><ol>{weakest.map((harness) => <li key={harness.n}><span>{String(harness.n).padStart(2, '0')}</span>{harness.name}<b>{levels[scores[harness.n]]}</b></li>)}</ol></>}
      </aside>
    </section>

    <section className="cost-model section-shell" aria-labelledby="cost-title">
      <div><div className="section-number">COST MODEL / ILLUSTRATIVE</div><h2 id="cost-title">Make the arithmetic visible.</h2><p>This is not a quote. Change the operating assumptions and compare the shape of single-agent and multi-agent work before choosing the architecture.</p></div>
      <form onSubmit={(event) => event.preventDefault()}>
        <label>Tasks per day<input type="number" min="1" value={tasks} onChange={(event) => setTasks(Number(event.target.value))} /></label>
        <label>Average steps per task<input type="number" min="1" value={steps} onChange={(event) => setSteps(Number(event.target.value))} /></label>
        <label>Illustrative cost per step<select value={rate} onChange={(event) => setRate(Number(event.target.value))}><option value="0.002">Efficient · $0.002</option><option value="0.006">Balanced · $0.006</option><option value="0.02">Frontier · $0.020</option></select></label>
        <label className="multi-toggle"><input type="checkbox" checked={multi} onChange={(event) => setMulti(event.target.checked)} /><span>Apply observed 15× multi-agent token multiplier</span></label>
      </form>
      <output><span>Estimated model cost / day</span><strong>${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><p>${(cost / tasks).toFixed(3)} per attempted task before retries, infrastructure, tools, or human review.</p></output>
    </section>
  </>;
}
