'use client';

import { useEffect, useRef, useState } from 'react';

type JourneyStep = {
  n: number;
  phase: string;
  plane: string;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  label: string;
  narrative: string;
  carries: string;
  contract: string;
  watch: string[];
};

export function JourneyStory({ steps }: { steps: JourneyStep[] }) {
  const [active, setActive] = useState(1);
  const refs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
    }, { rootMargin: '-28% 0px -52% 0px', threshold: [0.1, 0.5, 0.9] });
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const activeStep = steps[active - 1];
  return (
    <div className="journey-layout section-shell">
      <aside className={`journey-monitor plane-${activeStep.plane}`} aria-live="polite">
        <div className="monitor-top"><span>LIVE SEQUENCE</span><b>{String(active).padStart(2, '0')} / 43</b></div>
        <div className="monitor-route">
          <div><span>{activeStep.from}</span><p>{activeStep.fromLabel}</p></div>
          <div className="route-pulse" aria-hidden="true" />
          <div><span>{activeStep.to}</span><p>{activeStep.toLabel}</p></div>
        </div>
        <h2>{activeStep.label}</h2>
        <p>{activeStep.phase}</p>
        <ol aria-label="Forty-three sequence steps">
          {steps.map((step) => <li key={step.n} className={step.n === active ? 'active' : step.n < active ? 'passed' : ''}><a href={`#step-${step.n}`} aria-label={`Go to step ${step.n}`}>{step.n}</a></li>)}
        </ol>
      </aside>
      <div className="journey-story">
        {steps.map((step, index) => {
          const showBanner = index === 0 || step.phase !== steps[index - 1].phase;
          return (
            <div key={step.n}>
              {showBanner && <div className={`phase-banner plane-${step.plane}`}><span>{step.phase}</span><p>{step.n <= 5 ? 'Establish identity, authority, budget, and a clean starting point.' : step.n <= 32 ? 'Ground, reason, gate, act, observe, and decide whether to continue.' : step.n <= 37 ? 'Persist only what is earned, validate the answer, and deliver it with provenance.' : 'Turn traces into evidence, evidence into release decisions, and decisions into safer operation.'}</p></div>}
              <article id={`step-${step.n}`} data-step={step.n} ref={(node) => { refs.current[index] = node; }} className={`journey-step plane-${step.plane}`}>
                <span className="step-number">{String(step.n).padStart(2, '0')}</span>
                <div>
                  <p className="step-route">{step.fromLabel} → {step.toLabel}</p>
                  <h3>{step.narrative}</h3>
                  <details>
                    <summary>What’s happening technically</summary>
                    <dl><div><dt>Exchange</dt><dd>{step.label}</dd></div><div><dt>Carries</dt><dd>{step.carries}</dd></div><div><dt>Contract</dt><dd>{step.contract}</dd></div><div><dt>Watch</dt><dd>{step.watch.join(' · ')}</dd></div></dl>
                  </details>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
