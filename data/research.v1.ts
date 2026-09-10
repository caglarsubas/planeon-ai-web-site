// Curated reading guide, not a capability benchmark or a regulatory classification.
// Source titles/records reviewed 2026-09-07. Raw research inputs remain separate.
export const researchVersion = '2026-09-07.1';
const paper = (id: string) => `https://arxiv.org/abs/${id}`;
export const catalogue = [
  ['Self-Harness', 'Harness evolution', paper('2606.09498'), 'Research paper'],
  [
    'Observability-driven agentic harness engineering',
    'Harness evolution',
    paper('2604.25850'),
    'Research paper',
  ],
  [
    'Harness Handbook',
    'Harness evolution',
    paper('2607.13285'),
    'Research paper',
  ],
  ['CTIFoundry', 'Harness evolution', paper('2608.18613'), 'Research paper'],
  [
    'STOP: Self-Taught Optimizer',
    'Harness evolution',
    paper('2310.02304'),
    'Research paper',
  ],
  [
    'Harnessing Agentic Evolution',
    'Harness evolution',
    paper('2605.13821'),
    'Research paper',
  ],
  ['RecHarness', 'Harness evolution', paper('2607.29241'), 'Research paper'],
  [
    'Darwin Gödel Machine',
    'Architecture search',
    paper('2505.22954'),
    'Research paper',
  ],
  ['Hyperagents', 'Architecture search', paper('2603.19461'), 'Research paper'],
  [
    'Gödel Agent',
    'Architecture search',
    'https://aclanthology.org/2025.acl-long.1354/',
    'ACL paper',
  ],
  [
    'Automated Design of Agentic Systems',
    'Architecture search',
    paper('2408.08435'),
    'Research paper',
  ],
  [
    'AlphaEvolve',
    'Architecture search',
    'https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/',
    'Developer report',
  ],
  ['GEPA', 'Prompts and memory', paper('2507.19457'), 'Research paper'],
  ['Voyager', 'Prompts and memory', paper('2305.16291'), 'Research paper'],
  ['MemGPT', 'Prompts and memory', paper('2310.08560'), 'Research paper'],
  ['ACE-RTL', 'Prompts and memory', paper('2602.10218'), 'Research paper'],
  ['MUSE', 'Prompts and memory', paper('2606.03005'), 'Research paper'],
  [
    'S1-NexusAgent',
    'Prompts and memory',
    paper('2602.01550'),
    'Research paper',
  ],
  ['Agent-Dice', 'Continual learning', paper('2601.03641'), 'Research paper'],
  [
    'Modular continual learning under zero-leakage constraints',
    'Continual learning',
    paper('2604.14375'),
    'Research paper',
  ],
  [
    'Can Scale Save Us From Plasticity Loss in LLMs?',
    'Continual learning',
    paper('2606.24752'),
    'Research paper',
  ],
  [
    'When Continual Learning Moves to Memory',
    'Continual learning',
    paper('2604.27003'),
    'Research paper',
  ],
  [
    'Forgetting and plasticity: co-observation',
    'Continual learning',
    paper('2608.18803'),
    'Research paper',
  ],
  [
    'Elastic Weight Consolidation',
    'Learning foundations',
    paper('1612.00796'),
    'Research paper',
  ],
  [
    'Gradient Episodic Memory',
    'Learning foundations',
    paper('1706.08840'),
    'Research paper',
  ],
  [
    'Model-Agnostic Meta-Learning',
    'Learning foundations',
    'https://proceedings.mlr.press/v70/finn17a.html',
    'ICML paper',
  ],
  [
    'Differentiable plasticity',
    'Learning foundations',
    paper('1804.02464'),
    'Research paper',
  ],
  [
    'Population Based Training',
    'Learning foundations',
    paper('1711.09846'),
    'Research paper',
  ],
  [
    'QDax',
    'Learning foundations',
    'https://www.jmlr.org/papers/v25/23-1027.html',
    'JMLR paper',
  ],
  [
    'Rapid Motor Adaptation',
    'Learning foundations',
    paper('2107.04034'),
    'Research paper',
  ],
  [
    'Amazon Bedrock AgentCore Evaluations',
    'Operating practice',
    'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/how-it-works-evaluations.html',
    'Product documentation',
  ],
  [
    'Anthropic multi-agent research system',
    'Operating practice',
    'https://www.anthropic.com/engineering/multi-agent-research-system',
    'Developer report',
  ],
  [
    'ReasoningBank',
    'Prompts and memory',
    'https://research.google/blog/reasoningbank-enabling-agents-to-learn-from-experience/',
    'Research team report',
  ],
  [
    'OpenTelemetry GenAI semantic conventions',
    'Operating practice',
    'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
    'Version-sensitive specification',
  ],
  [
    'Inspect evaluation framework',
    'Operating practice',
    'https://inspect.aisi.org.uk/',
    'Project documentation',
  ],
] as const;

export const analogies = [
  [
    'Association',
    'Reuse a verified route or memory when its context still applies. Frequency alone is not correctness.',
  ],
  [
    'Stability',
    'Bound context growth, tool proliferation, mutation size and resource use.',
  ],
  [
    'Learning about learning',
    'Treat a changed update rule as a new candidate requiring independent evaluation.',
  ],
  [
    'Gating',
    'Separate the signal proposing an edit from the authority permitting its promotion.',
  ],
  [
    'Consolidation',
    'Retest retained capabilities when integrating new knowledge or behaviour.',
  ],
  [
    'Fast and slow learning',
    'Keep transient task state separate from reviewed, persistent release changes.',
  ],
  [
    'Structural change',
    'Version the introduction, retirement or rewiring of tools and workflows.',
  ],
  [
    'Recovery',
    'Adapt to a failed dependency within existing permissions; broader changes require authorization.',
  ],
] as const;
export const changeSurfaces = [
  [
    'Working state',
    'Task context and scratch state',
    'Even transient state can lead to irreversible actions; retention and recovery still need explicit boundaries.',
  ],
  [
    'Persistent memory',
    'Entries, summaries, indexes and retention rules',
    'Check provenance, consent, tenant scope, deletion and poisoning resistance.',
  ],
  [
    'Prompts and workflow',
    'Instructions, routing and procedural configuration',
    'Keep the old version and compare held-out behaviour, safety and cost before promotion.',
  ],
  [
    'System structure',
    'Tools, modules and delegation topology',
    'Review new capabilities, interfaces and attack surface; contain candidate execution.',
  ],
  [
    'Model parameters',
    'Weights and adapters',
    'Evaluate retained and new capabilities with a reproducible training and release lineage.',
  ],
  [
    'Improvement machinery',
    'The search strategy or evaluation process',
    'Protect independent holdouts and promotion authority from the proposer.',
  ],
  [
    'Objectives and authority',
    'Goals, policy limits and permissions',
    'In this design, these are protected inputs controlled outside the adapting component.',
  ],
] as const;
export const adaptationPermissions = [
  [
    'L0 · Frozen release',
    'No persistent adaptation is permitted. Normal operation still changes task state.',
  ],
  [
    'L1 · Task-local adaptation',
    'Adjust task context within a fixed policy; do not silently persist it into later releases.',
  ],
  [
    'L2 · Reviewed persistence',
    'A designated reviewer authorizes persistent memory, prompt or skill changes.',
  ],
  [
    'L3 · Bounded promotion',
    'A separately authorized policy may permit promotion within a narrow, tested envelope. An independent gate still decides.',
  ],
  [
    'L4 · Broad sandbox search',
    'Explore broader candidates in isolation; production promotion remains separately authorized.',
  ],
  [
    'L5 · Unrestricted self-promotion',
    'A research horizon, not a recommended production mode or an enabled Planeon capability.',
  ],
] as const;
export const patterns = [
  [
    'Separate proposal from promotion',
    'The candidate producer cannot confer production authority on its own output.',
  ],
  [
    'Contain experiments',
    'Use isolated candidate environments with explicit network, data and credential boundaries.',
  ],
  [
    'Version the release',
    'Record content digests, provenance, compatibility and approval alongside the complete release manifest.',
  ],
  [
    'Limit initial exposure',
    'Choose shadow evaluation or an authorized canary; shadow execution must not create duplicate external effects.',
  ],
  [
    'Retain independent tests',
    'Check new behaviour and old obligations; protect holdouts and evaluator configuration.',
  ],
  [
    'Observe operational evidence',
    'Record supplied inputs, policy decisions, tool results and state changes with appropriate redaction.',
  ],
  [
    'Govern memory',
    'Scope reads and writes by tenant and purpose; review provenance, expiry and deletion.',
  ],
  [
    'Budget the search',
    'Set time, compute, action and spend limits before an improvement run starts.',
  ],
  [
    'Test recovery, not just rollout',
    'Stopping actions, restoring a version and compensating an external effect are different operations.',
  ],
  [
    'Match approval to consequence',
    'Name the decision authority and consider impact, reversibility and uncertainty.',
  ],
  [
    'Separate shared and tenant artifacts',
    'Cross-tenant reuse requires its own data-rights, isolation and promotion review.',
  ],
] as const;
export const metrics = [
  [
    'Capability',
    'Success on a held-out, deployment-relevant task set; report population, denominator and uncertainty.',
  ],
  [
    'Retention',
    'Report backward transfer (current minus initial performance on earlier tasks) separately from forgetting (best historical minus current performance).',
  ],
  [
    'Forward transfer',
    'Compare unseen-task performance or sample requirements with a specified baseline.',
  ],
  [
    'Residual plasticity',
    'Measure learning on a fresh task after a stated number of adaptation cycles.',
  ],
  [
    'Adaptation latency',
    'Time or interactions needed to regain a defined performance threshold.',
  ],
  [
    'Sample efficiency',
    'Improvement per new example or interaction, with a fixed evaluation set.',
  ],
  [
    'Safety',
    'Violation frequency and severity for a declared threat model and test population.',
  ],
  [
    'Corrigibility',
    'Compliance with interruption, correction and authority withdrawal.',
  ],
  [
    'Mutation quality',
    'Accepted candidates per proposal, alongside the benefit of accepted changes.',
  ],
  [
    'Regression escapes',
    'Promoted changes later found to violate retained requirements.',
  ],
  [
    'Structural complexity',
    'Growth of tools, dependencies, code and workflow edges per useful improvement.',
  ],
  [
    'Diversity',
    'Coverage of meaningfully different candidate behaviours, not just different names.',
  ],
  [
    'Resource cost',
    'Time, tokens, compute and money per validated improvement.',
  ],
  [
    'Recovery fidelity',
    'Separate successful version restoration, state reconstruction and external-effect compensation.',
  ],
] as const;
export const researchQuestions = [
  'Which subsystem should change, and what evidence supports that choice?',
  'How can evaluator independence survive repeated optimization against its feedback?',
  'What remains stable when the improvement rule itself is modified?',
  'How can open-ended architecture search stay within verifiable constraints?',
  'How should retention be measured when the environment and task meanings drift?',
  'How can useful generalization coexist with required deletion of individual memories?',
  'Can uncertainty safely inform a change budget without expanding authority?',
  'What makes a system reproducible after many changes to interconnected artifacts?',
  'How should embodied adaptation account for irreversible physical consequences?',
  'Which objectives and permissions must remain outside the optimization loop?',
] as const;
