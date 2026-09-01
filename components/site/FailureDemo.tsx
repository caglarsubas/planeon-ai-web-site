'use client';

import { useState } from 'react';
import Link from 'next/link';

const scenarios = [
  { id: 13, label: 'Guardrails', step: 'Step 14', effect: 'A retrieved document contains an instruction. The agent follows it and exposes restricted data.', prevention: 'Security, Safety & Guardrails would screen retrieved content again inside the loop.' },
  { id: 8, label: 'Memory write policy', step: 'Step 33', effect: 'A flawed outcome is written as trusted memory. Tomorrow, the agent repeats the mistake with greater confidence.', prevention: 'Memory & State would require an explicit write policy, provenance, retention, and redaction decision.' },
  { id: 15, label: 'Observability', step: 'Step 38', effect: 'The incident happens, but the trace breaks before anyone can reconstruct the decision.', prevention: 'Observability & FinOps would preserve correlated spans, costs, decisions, and the evidence needed for replay.' },
];

export function FailureDemo() {
  const [active, setActive] = useState(scenarios[0]);
  return (
    <section className="failure-demo section-shell" aria-labelledby="failure-title">
      <div className="failure-controls">
        <div className="section-number">ILLUSTRATION / SWITCH A HARNESS OFF</div>
        <h2 id="failure-title">Absence is easier to see than architecture.</h2>
        <p>Choose a boundary to remove from the reference task. This is a scripted illustration, not a live model simulation.</p>
        <fieldset className="failure-buttons">
          <legend className="sr-only">Failure scenarios</legend>
          {scenarios.map((scenario) => (
            <button key={scenario.id} type="button" aria-pressed={active.id === scenario.id} onClick={() => setActive(scenario)}>
              <span>{scenario.id}</span>{scenario.label}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="failure-result" aria-live="polite">
        <span>{active.step} / BOUNDARY REMOVED</span>
        <h3>{active.effect}</h3>
        <p>{active.prevention}</p>
        <Link prefetch={false} href={`/blueprint/${active.id}`}>Inspect harness {active.id} ↗</Link>
      </div>
    </section>
  );
}
