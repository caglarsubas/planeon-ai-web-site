'use client';

import { useEffect, useMemo, useState } from 'react';
import content from '@/data/content.json';

type Harness = (typeof content.harnesses)[keyof typeof content.harnesses];
type Selection = { title: string; eyebrow: string; body: string; items?: string[]; link?: string } | null;
type Participant = { title?: string; h: number | null; role: string; watch: string[] };
const planeOrder = ['knowledge', 'execution', 'trust', 'runtime'] as const;
const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);
const participants = content.sequence.participants as unknown as Record<string, Participant>;

function harnessSelection(harness: Harness): Selection {
  return {
    title: `${harness.n} · ${harness.name}`,
    eyebrow: `${content.planes[harness.plane as keyof typeof content.planes].label} / Phase ${harness.phase}`,
    body: harness.mandate,
    items: harness.signals,
    link: `/blueprint/${harness.n}`,
  };
}

export function Explorer() {
  const [colorBy, setColorBy] = useState<'plane' | 'phase'>('plane');
  const [phase, setPhase] = useState<'all' | number>('all');
  const [selected, setSelected] = useState<Selection>(null);
  const [diagram, setDiagram] = useState<'sequence' | 'flow'>('sequence');
  const [zoom, setZoom] = useState(1);

  const selectHarness = (harness: Harness) => {
    setSelected(harnessSelection(harness));
    history.replaceState(null, '', `#harness-${harness.n}`);
  };

  useEffect(() => {
    let frame = 0;
    const match = location.hash.match(/^#harness-(\d+)$/);
    if (match) {
      const harness = harnesses.find((item) => item.n === Number(match[1]));
      if (harness) {
        frame = requestAnimationFrame(() => {
          setSelected(harnessSelection(harness));
          document.getElementById(`harness-${harness.n}`)?.scrollIntoView({ block: 'center' });
        });
      }
    }
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', close);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', close);
    };
  }, []);

  const sequenceItems = useMemo(() => Array.from({ length: 43 }, (_, index) => {
    const id = `m${index + 1}`;
    const meta = (content.sequence.messageMeta as Record<string, { from: string; to: string; label: string }>)[id];
    const detail = (content.sequence.messages as Record<string, { carries: string; contract: string; watch: string[] }>)[id];
    return { id, n: index + 1, ...meta, ...detail };
  }), []);
  const flowNodes = Object.entries(content.layeredFlow.nodes);
  const flowEdges = Object.entries(content.layeredFlow.edgeMeta as unknown as Record<string, { from: string; to: string; text: string }>);

  return <section className="explorer-shell section-shell">
    <div className="explorer-toolbar">
      <div><span>COLOUR BY</span><button aria-pressed={colorBy === 'plane'} onClick={() => setColorBy('plane')}>Concern plane</button><button aria-pressed={colorBy === 'phase'} onClick={() => setColorBy('phase')}>Build phase</button></div>
      <label><span>SHOW PHASE</span><select value={phase} onChange={(event) => setPhase(event.target.value === 'all' ? 'all' : Number(event.target.value))}><option value="all">All phases</option>{content.buildPhases.map((item) => <option key={item.id} value={item.id}>Phase {item.id}</option>)}</select></label>
    </div>

    <div className="explorer-stage">
      <fieldset className={`onion-explorer color-${colorBy}`}>
        <legend className="sr-only">Interactive map of sixteen harnesses</legend>
        {content.rings.map((ring, ringIndex) => <div key={ring.plane} className={`explorer-ring plane-${ring.plane}`} style={{ width: `${40 + ringIndex * 18}%`, height: `${40 + ringIndex * 18}%` }}><span>{ring.label}</span></div>)}
        <div className="explorer-core"><b>0</b><span>Models</span></div>
        {planeOrder.flatMap((plane, ringIndex) => {
          const ids = content.rings.find((ring) => ring.plane === plane)?.ids ?? [];
          const radius = 24 + ringIndex * 9;
          return ids.map((id, index) => {
            const harness = harnesses.find((item) => item.n === id)!;
            const angle = (-90 + index * 90 + ringIndex * 12) * Math.PI / 180;
            const left = (50 + Math.cos(angle) * radius).toFixed(5);
            const top = (50 + Math.sin(angle) * radius).toFixed(5);
            const hidden = phase !== 'all' && harness.phase !== phase;
            return <button id={`harness-${id}`} key={id} className={`harness-node plane-${plane} phase-${harness.phase}`} style={{ left: `${left}%`, top: `${top}%` }} aria-label={`${id} · ${harness.name}`} aria-pressed={selected?.title.startsWith(`${id} ·`) ?? false} disabled={hidden} onClick={() => selectHarness(harness)}><span>{id}</span><b>{harness.name}</b></button>;
          });
        })}
      </fieldset>
      <div className="explorer-mobile-list" aria-label="Harness list fallback">{harnesses.filter((h) => phase === 'all' || h.phase === phase).map((harness) => <button key={harness.n} className={`plane-${harness.plane}`} onClick={() => selectHarness(harness)}><span>{String(harness.n).padStart(2, '0')}</span>{harness.name}</button>)}</div>
      <aside className="selection-card" aria-live="polite">
        {selected ? <><button className="selection-close" aria-label="Close detail" onClick={() => setSelected(null)}>×</button><span>{selected.eyebrow}</span><h2>{selected.title}</h2><p>{selected.body}</p>{selected.items && <><h3>Signals</h3><ul>{selected.items.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul></>}{selected.link && <a href={selected.link}>Open full detail ↗</a>}</> : <><span>SELECT A BOUNDARY</span><h2>Inspect the architecture.</h2><p>Choose a numbered harness, sequence participant, message, flow node, or edge. Press Esc to clear the current selection.</p></>}
      </aside>
    </div>

    <section className="diagram-workbench" aria-labelledby="diagram-title">
      <header><div><div className="section-number">END-TO-END REFERENCE</div><h2 id="diagram-title">Every exchange has a contract.</h2></div><div className="diagram-controls"><div role="tablist" aria-label="Diagram"><button role="tab" aria-selected={diagram === 'sequence'} onClick={() => setDiagram('sequence')}>Sequence</button><button role="tab" aria-selected={diagram === 'flow'} onClick={() => setDiagram('flow')}>Layered flow</button></div><div aria-label="Zoom"><button onClick={() => setZoom((value) => Math.max(.75, value - .25))} aria-label="Zoom out">−</button><output>{Math.round(zoom * 100)}%</output><button onClick={() => setZoom((value) => Math.min(1.5, value + .25))} aria-label="Zoom in">+</button></div></div></header>
      <div className="diagram-viewport">
        {diagram === 'sequence' ? <div className="sequence-diagram" style={{ '--diagram-zoom': zoom } as React.CSSProperties}>
          <div className="lifeline-header">{Object.entries(participants).map(([id, participant]) => <button key={id} onClick={() => setSelected({ title: participant.title ?? (harnesses.find((h) => h.n === participant.h)?.name ?? id), eyebrow: `PARTICIPANT / ${id}`, body: participant.role, items: participant.watch })}><b>{id}</b><span>{participant.title ?? harnesses.find((h) => h.n === participant.h)?.name}</span></button>)}</div>
          <ol>{sequenceItems.map((message) => <li key={message.id}><button onClick={() => setSelected({ title: `${message.n} · ${message.label}`, eyebrow: `${message.from} → ${message.to}`, body: message.carries, items: [message.contract, ...message.watch] })}><span>{String(message.n).padStart(2, '0')}</span><b>{message.from}</b><i>→</i><b>{message.to}</b><p>{message.label}</p></button></li>)}</ol>
        </div> : <div className="flow-diagram" style={{ '--diagram-zoom': zoom } as React.CSSProperties}>{Object.entries(content.sequence.phases).map(([phaseId, phaseData]) => <section key={phaseId} className={`plane-${phaseData.plane}`}><header><span>{phaseId}</span><h3>{phaseData.name}</h3></header><div>{flowNodes.filter(([, node]) => node.cluster === phaseId).map(([id, node]) => <button key={id} onClick={() => setSelected({ title: node.title, eyebrow: `FLOW NODE / ${id}`, body: node.role, items: node.watch })}><span>{id}</span>{node.title}</button>)}</div></section>)}<div className="edge-ledger"><h3>29 typed handoffs</h3>{flowEdges.map(([id, edge]) => <button key={id} onClick={() => { const detail = (content.layeredFlow.edges as Record<string, { carries: string; contract: string; watch: string[] }>)[id]; setSelected({ title: `${edge.from} → ${edge.to}`, eyebrow: `FLOW EDGE / ${id}`, body: detail.carries, items: [detail.contract, ...detail.watch] }); }}><span>{id}</span>{edge.text}</button>)}</div></div>}
      </div>
    </section>
  </section>;
}
