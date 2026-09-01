import type { Metadata } from 'next';
import content from '@/data/content.json';
import { JourneyStory } from '@/components/site/JourneyStory';
import { PageIntro, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'One Task, End to End', description: 'Follow forty-three exchanges as an enterprise agent changes the delivery address on a paid order.' };

const narratives = [
  'A customer asks to change the delivery address on an order that has already been paid for.',
  'The request is attached to the customer, organisation, channel, and current session.',
  'Before any model is called, the request is screened for hostile instructions and sensitive data.',
  'A narrowly scoped agent identity is allowed to continue inside the customer’s entitlements.',
  'The task begins with an explicit cost, time, and step budget.',
  'The system resolves what “delivery address” and “paid order” mean in this business.',
  'The task now uses the same entities and rules as the order system.',
  'Only the context required for this decision is assembled.',
  'The order record is requested under the customer’s own entitlements.',
  'Governed data arrives with lineage showing where every fact came from.',
  'The system checks whether this customer or order has relevant prior history.',
  'Only tenant-safe, relevant memory is returned.',
  'The usable facts are compacted into a bounded context.',
  'The orchestrator asks for the next safe action, not a prose answer.',
  'The gateway selects a pinned model tier and records the cost envelope.',
  'The model reasons over the prepared context.',
  'The model returns a proposed next action.',
  'The proposal is checked against a schema before anything can act on it.',
  'The address change is scored for impact, reversibility, sensitivity, and confidence.',
  'Because the order is paid, the workflow pauses at a durable approval checkpoint.',
  'An authorised person approves or rejects the change with the evidence in view.',
  'The decision is recorded and the workflow resumes without losing state.',
  'A typed address-change operation is prepared for execution.',
  'The operation receives isolation proportional to its blast radius.',
  'The sandbox becomes ready without receiving ambient credentials.',
  'A cheaper specialist validates the address and delivery constraints.',
  'A structured score returns without spending another language-model call.',
  'The call crosses the boundary on a versioned standard contract.',
  'The order system receives only the scoped operation it knows how to authorise.',
  'The system of record returns the updated order or a typed failure.',
  'The response is converted back into the tool contract.',
  'The result is observed, then the orchestrator decides whether another loop is needed.',
  'Only durable knowledge that passes the memory-write policy is retained.',
  'The final response is validated for schema, policy, and data leakage.',
  'A clean, permitted result returns through the gateway.',
  'The cost is attributed to the correct tenant and successful task.',
  'The customer receives the result with provenance and any limitations stated plainly.',
  'Every hop contributes a correlated span to the same task trace.',
  'The trace becomes an evaluation case the system can replay.',
  'Evaluation evidence informs whether the current release remains admissible.',
  'Approved, versioned changes can be deployed back into the execution system.',
  'Governance policy is compiled into the guardrails that enforce it on every call.',
  'Capacity, availability, and cost close the operational picture.',
];

export default function JourneyPage() {
  const participantEntries = content.sequence.participants as Record<string, { title?: string; h?: number | null }>;
  const meta = content.sequence.messageMeta as Record<string, { from: string; to: string; label: string }>;
  const messages = content.sequence.messages as Record<string, { carries: string; contract: string; watch: string[] }>;
  const phases = content.sequence.phases;
  const harnesses = Object.values(content.harnesses);
  const labelFor = (id: string) => participantEntries[id]?.title ?? harnesses.find((h) => h.n === participantEntries[id]?.h)?.name ?? id;
  const phaseFor = (n: number): { id: string; data: typeof phases.PH1; plane: string } => n <= 5 ? { id: 'PH1', data: phases.PH1, plane: 'runtime' } : n <= 32 ? { id: 'PH2', data: phases.PH2, plane: 'execution' } : n <= 37 ? { id: 'PH3', data: phases.PH3, plane: 'knowledge' } : { id: 'PH4', data: phases.PH4, plane: 'trust' };
  const steps = Array.from({ length: 43 }, (_, index) => {
    const n = index + 1;
    const key = `m${n}`;
    const phase = phaseFor(n);
    return { n, phase: `${phase.id} · ${phase.data.name}`, plane: phase.plane, from: meta[key].from, to: meta[key].to, fromLabel: labelFor(meta[key].from), toLabel: labelFor(meta[key].to), label: meta[key].label, narrative: narratives[index], ...messages[key] };
  });
  return (
    <main><SiteHeader /><PageIntro eyebrow="Journey / 43 exchanges" title="A small request. A complete system." description="A customer wants to change the delivery address on an order that has already been paid for. Follow the request from channel to record, through every control that makes the result defensible." /><JourneyStory steps={steps} /><SiteFooter /></main>
  );
}
