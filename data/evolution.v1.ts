import type { changes } from './operating.v1';

export const evolutionVersion = '2026-09-08.1';

// Editorial examples of the existing change envelopes, not customer results.
// Provenance: governed-evolution report and neuroplastic explorer, recorded in
// provenance.v1.json. No performance claims or new adaptation permissions.
export const learningStages = [
  {
    id: 'observation',
    name: 'Notice a pattern',
    owner: 'Observability + task owner',
    principle:
      'Review recorded outcomes, user feedback and failures. This review is separate from the live task; it does not change the system by itself.',
  },
  {
    id: 'proposal',
    name: 'Propose a change',
    owner: 'Human or optimizer',
    principle:
      'Create a separate candidate version with declared limits. The component proposing a change cannot approve its own release.',
  },
  {
    id: 'evaluation',
    name: 'Test independently',
    owner: 'Evaluation + Security',
    principle:
      'Compare with the approved version on independent tests. Check both the intended improvement and the boundaries that must not change.',
  },
  {
    id: 'authorization',
    name: 'Approve the version',
    owner: 'Governance',
    principle:
      'An authorized reviewer or pre-authorized policy approves the exact candidate and its evidence. Missing or failed evidence means hold.',
  },
  {
    id: 'rollout',
    name: 'Try a limited release',
    owner: 'Target owner + Compute',
    principle:
      'Release only the approved version to a limited scope. Keep the previous compatible version available and define when to stop.',
  },
  {
    id: 'monitoring',
    name: 'Learn from results',
    owner: 'Observability + Evaluation',
    principle:
      'Check actual outcomes and protected controls. Keep or withdraw the change; a new idea must pass through the same checks again.',
  },
] as const;

export type LearningStageId = (typeof learningStages)[number]['id'];
export type EvolutionChangeId = (typeof changes)[number]['id'];
type LearningStory = {
  label: string;
  title: string;
  context: string;
  before: { title: string; detail: string };
  after: { title: string; detail: string };
  remains: string;
  stages: Record<LearningStageId, string>;
};

export const learningStories: Record<EvolutionChangeId, LearningStory> = {
  retrieval: {
    label: 'Better retrieval',
    title: 'Same request. Better evidence.',
    context:
      'A customer asks to change the delivery address on an order that is already paid for—the same example used in Journey.',
    before: {
      title: 'The relevant policy arrives too late.',
      detail:
        'A general shipping FAQ fills the context. The address-change policy is ranked too low to help the agent answer.',
    },
    after: {
      title: 'The right policy reaches the agent first.',
      detail:
        'A revised retrieval rule prioritizes the applicable address-change policy, with its source, before the agent decides what to do.',
    },
    remains:
      'The model can stay the same. Source permissions, customer identity checks and approval requirements still apply.',
    stages: {
      observation:
        'Review completed address-change tasks. In this example, the applicable policy exists, but a generic FAQ repeatedly displaces it from the supplied context.',
      proposal:
        'A retrieval owner or optimizer proposes a different ranking rule and context budget. Save it as a candidate; do not replace the live configuration.',
      evaluation:
        'Use held-out address-change questions to check whether the candidate supplies the right policy. Also test unrelated tasks, fresh sources, citations and denied-access cases.',
      authorization:
        'Governance reviews the exact ranking configuration, independent results and Security constraints. A better answer does not excuse a source-permission failure.',
      rollout:
        'After approval, use the new retrieval configuration for a limited share of eligible work. Keep the previous configuration ready to restore.',
      monitoring:
        'Check whether answers use the applicable policy and retain valid citations without disclosing restricted sources. A regression triggers withdrawal; a new pattern starts another review.',
    },
  },
  memory: {
    label: 'More reliable memory',
    title: 'Useful history. Less contradiction.',
    context:
      'An agent uses past interactions to continue a customer task. Repeated records can leave it with competing versions of the same fact.',
    before: {
      title: 'Old and current facts compete.',
      detail:
        'Duplicated or contradictory memories are retrieved together, making it unclear which record the agent should rely on.',
    },
    after: {
      title: 'Relevant history keeps its provenance.',
      detail:
        'An approved consolidation rule removes duplication and flags contradictions while retaining the sources and retention rules needed to interpret each fact.',
    },
    remains:
      'This changes memory handling, not model weights. Consent, tenant isolation and deletion requests remain protected.',
    stages: {
      observation:
        'Review completed tasks that used duplicate or contradictory records. Identify the affected memory partition without combining data across tenants.',
      proposal:
        'The memory owner proposes a bounded consolidation rule for duplicates, summaries and expiration. Keep the original provenance and a separate candidate batch.',
      evaluation:
        'Test recall and contradiction handling against the approved version. Confirm that other tenants cannot access the records and deleted facts do not return.',
      authorization:
        'Governance reviews the retention-policy change, Evaluation evidence and Security isolation checks before authorizing the specific rule and partition.',
      rollout:
        'Apply the approved rule to a bounded batch in the approved partition. Limit processing and retained size; isolate the new output from unrelated memory.',
      monitoring:
        'Review recall, contradictions, source provenance and deletion persistence. Quarantine a regressing batch and use the findings to propose a new rule, not to expand its authority.',
    },
  },
  tools: {
    label: 'Clearer tool instructions',
    title: 'Clearer inputs. More dependable actions.',
    context:
      'An agent calls a business tool, but ambiguous field descriptions make it easy to supply the wrong arguments.',
    before: {
      title: 'The tool request is ambiguous.',
      detail:
        'A loosely defined input can produce rejected calls or unclear intent, even when the underlying operation is permitted.',
    },
    after: {
      title: 'The tool contract makes intent explicit.',
      detail:
        'A stricter schema and clearer descriptions help the agent supply valid arguments. The operation still needs its existing authorization and outcome checks.',
    },
    remains:
      'Clearer instructions do not grant new powers. Allowed operations, target identity, network limits and duplicate-action protections remain unchanged.',
    stages: {
      observation:
        'Review failed or rejected calls and their supplied arguments. Identify an ambiguous field rather than assuming the model needs retraining.',
      proposal:
        'The tool owner proposes a clearer description and stricter input/output schema in a separate contract version. Do not add new allowed operations.',
      evaluation:
        'Validate in a sandbox with synthetic state: compatible callers, malformed inputs, approval replay, duplicate execution and independently verified outcomes.',
      authorization:
        'Governance authorizes the exact tool contract after independent Evaluation and Security review. The owner who proposed it cannot release it alone.',
      rollout:
        'Deploy the approved contract to a limited set of eligible tasks and callers. Keep compatible contracts available and preserve per-action authorization.',
      monitoring:
        'Inspect accepted and rejected calls alongside verified outcomes. Stop new dispatches on a regression; restoring a contract does not undo an external action already taken.',
    },
  },
};

export const recoveryStages = {
  reject: 'evaluation',
  withdraw: 'rollout',
  recover: 'monitoring',
} as const satisfies Record<string, LearningStageId>;
