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
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [requestMessage, setRequestMessage] = useState('');
  const [formStartedAt] = useState(() => Date.now());
  const cost = tasks * steps * rate * (multi ? 15 : 1);

  const submitConsultancyRequest = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const readField = (key: string, fallback = '') => {
      const value = form.get(key);
      return typeof value === 'string' ? value : fallback;
    };
    const service = readField('service', 'Combined assessment and roadmap');
    const name = readField('name');
    const email = readField('email');
    const organisation = readField('organisation');
    const timeframe = readField('timeframe', 'Not specified');
    const brief = readField('brief');
    const currentReading = completed
      ? `${completed}/16 boundaries rated. Current weakest boundaries: ${weakest.map((item) => `${item.n} · ${item.name} (${levels[scores[item.n]]})`).join('; ')}.`
      : 'The self-assessment has not been completed yet.';
    setRequestState('sending');
    setRequestMessage('Sending your request securely…');

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          name,
          email,
          organisation,
          timeframe,
          brief,
          currentReading,
          companyWebsite: readField('company_website'),
          startedAt: formStartedAt,
          consent: form.get('consent') === 'on',
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || 'The request could not be sent.');

      setRequestState('sent');
      setRequestMessage('Request sent. Planeon will review your context and respond by email.');
      formElement.reset();
    } catch (error) {
      setRequestState('error');
      setRequestMessage(error instanceof Error ? error.message : 'The request could not be sent. Please try again.');
    }
  };

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

    <section className="professional-request" id="professional-assessment" aria-labelledby="professional-title">
      <div className="professional-request-shell section-shell">
        <div className="professional-request-copy">
          <div className="section-number">PROFESSIONAL REVIEW / PLANEON</div>
          <h2 id="professional-title">Turn the reading into an accountable roadmap.</h2>
          <p>Bring one consequential workflow. Planeon will review the sixteen boundaries against your operating context, identify evidence gaps, and sequence the work required for a defensible pilot or production programme.</p>
          <ol>
            <li><span>01</span>Evidence-led readiness assessment</li>
            <li><span>02</span>Prioritised harness gap analysis</li>
            <li><span>03</span>Phased implementation roadmap</li>
          </ol>
        </div>
        <form className="professional-request-form" onSubmit={submitConsultancyRequest} aria-busy={requestState === 'sending'}>
          <fieldset>
            <legend>What do you need?</legend>
            <div className="request-service-options">
              {['Professional readiness assessment', 'Roadmap consultancy', 'Combined assessment and roadmap'].map((service, index) => (
                <label key={service}>
                  <input type="radio" name="service" value={service} defaultChecked={index === 2} />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="request-field-grid">
            <label>Name<input name="name" autoComplete="name" required /></label>
            <label>Work email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Organisation<input name="organisation" autoComplete="organization" required /></label>
            <label>Preferred timeframe<select name="timeframe" defaultValue="Within 30 days"><option>Within 30 days</option><option>This quarter</option><option>Next quarter</option><option>Exploring options</option></select></label>
          </div>
          <label className="request-brief">Workflow and objective<textarea name="brief" rows={5} maxLength={1200} required placeholder="Describe the workflow, current maturity, and the decision this engagement should support." /></label>
          <label className="request-trap" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off" /></label>
          <label className="request-consent"><input name="consent" type="checkbox" required /><span>I agree that Planeon may use these details to respond to this consultation request.</span></label>
          <div className="request-submit-row">
            <button className="button-primary" type="submit" aria-describedby="request-privacy" disabled={requestState === 'sending' || requestState === 'sent'}>{requestState === 'sending' ? 'Sending request…' : requestState === 'sent' ? 'Request sent' : 'Send consultation request'} <span aria-hidden="true">↗</span></button>
            <p id="request-privacy">Your details are sent securely to Planeon only when you submit this form. Your assessment answers otherwise remain in this browser.</p>
          </div>
          <output className={`request-status request-status-${requestState}`} aria-live="polite">{requestMessage}</output>
        </form>
      </div>
    </section>
  </>;
}
