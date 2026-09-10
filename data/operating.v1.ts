export const version = '2026-09-07.1';
export const operationalResponsibilities = [
  {
    name: 'DevOps',
    focus: 'Deliver software',
    responsibilities:
      'Version code, test contracts, build reproducibly and recover compatible releases.',
  },
  {
    name: 'MLOps',
    focus: 'Manage learned behaviour',
    responsibilities:
      'Track data and model lineage, validate statistical quality and monitor drift.',
  },
  {
    name: 'LLMOps',
    focus: 'Evaluate meaning',
    responsibilities:
      'Version prompts and retrieval, evaluate grounded answers and control model use.',
  },
  {
    name: 'AgentOps',
    focus: 'Control delegated action',
    responsibilities:
      'Bind identity and authority to each action; govern tools, memory, workflow and outcomes.',
  },
];
export const releaseArtifacts = [
  {
    id: 'code',
    name: 'Code & runtime',
    owner: 'runtime.infrastructure',
    version:
      'Immutable source revision, dependency lock and runtime image digest.',
    recovery:
      'Keep the previous compatible build available. A code rollback does not roll back external state.',
    evidence: 'A reproducible build record and a rehearsed restore procedure.',
  },
  {
    id: 'model',
    name: 'Model & configuration',
    owner: 'runtime.model-inference',
    version:
      'Model identifier or digest, serving configuration and decoding settings.',
    recovery:
      'Verify provider availability and compatibility before switching a pinned model.',
    evidence:
      'Representative quality, latency and safety comparisons for the exact configuration.',
  },
  {
    id: 'prompts',
    name: 'Prompts',
    owner: 'execution.orchestration',
    version:
      'Prompt template, variables, instruction boundaries and evaluation-set version.',
    recovery:
      'Restore the matching template and tool schema; do not substitute only the prose.',
    evidence: 'Regression results tied to the exact prompt artifact.',
  },
  {
    id: 'retrieval',
    name: 'Retrieval & data references',
    owner: 'knowledge.retrieval-context',
    version:
      'Corpus snapshot references, indexing/reranking configuration and source entitlements.',
    recovery:
      'Restore compatible indices and configuration without reviving revoked data access.',
    evidence:
      'Grounding, freshness and entitlement tests with source provenance.',
  },
  {
    id: 'tools',
    name: 'Tools & skills',
    owner: 'execution.tool-skill-sandbox',
    version:
      'Manifest, schema, executable digest and allowed-operation contract.',
    recovery:
      'Stop new dispatches; restore a compatible tool. Compensate prior effects only through authorized operations.',
    evidence:
      'Typed input/output, authorization, idempotency and negative-path tests.',
  },
  {
    id: 'workflow',
    name: 'Workflow',
    owner: 'execution.orchestration',
    version:
      'Graph revision, checkpoint format, budgets and termination conditions.',
    recovery:
      'Drain, migrate or resume in-flight tasks under an explicit compatibility policy.',
    evidence:
      'Checkpoint/resume, repeated-pass, parallel-join and interruption tests.',
  },
  {
    id: 'memory',
    name: 'Memory schema',
    owner: 'knowledge.memory-state',
    version:
      'Schema and migration version, provenance fields, partition rules and retention policy.',
    recovery:
      'Use a tested migration/recovery path; avoid resurrecting deleted or quarantined records.',
    evidence:
      'Tenant isolation, poisoning/quarantine and reversible migration tests.',
  },
  {
    id: 'policy',
    name: 'Policies',
    owner: 'trust.governance-agentops',
    version:
      'Policy bundle digest, approval authority and applicability record.',
    recovery:
      'Do not restore revoked permissions. Reconcile policy and runtime state before resuming.',
    evidence:
      'Signed approval decisions and deny-path tests for the selected policy.',
  },
  {
    id: 'identity',
    name: 'Identity configuration',
    owner: 'trust.security-safety',
    version:
      'References to workload identities, scopes, trust roots and credential-issuance policy—not secrets.',
    recovery:
      'Revoke compromised authority and reissue scoped credentials through the approved identity service.',
    evidence:
      'Actor/tenant binding, expiry, revocation and least-privilege tests.',
  },
];
export const operationalDimensions = [
  {
    name: 'Service',
    question:
      'Does the workflow complete, resume and recover within its agreed service limits?',
  },
  {
    name: 'Quality',
    question:
      'Are outcomes useful and evidence-grounded on representative tasks?',
  },
  {
    name: 'Safety',
    question: 'Are prohibited effects blocked, and are incidents contained?',
  },
  {
    name: 'Economics',
    question:
      'What is the cost per verified successful task, including retries and review?',
  },
  {
    name: 'Agency',
    question:
      'Does delegated action stay within identity, authority, budget and interruption bounds?',
  },
];
export const phaseContracts = [
  {
    prerequisite:
      'Name the workflow, its owner, affected systems and unacceptable effects.',
    deliverable:
      'A reproducible delivery foundation, scoped identity and minimum runtime boundaries.',
    evidence:
      'Build provenance, tenant/identity checks, deployment and recovery rehearsal.',
    condition:
      'Advance when the foundation can fail safely. Hold if authority, ownership or recovery remains undefined.',
  },
  {
    prerequisite: 'Phase 0 evidence is available for the selected workflow.',
    deliverable:
      'An evidence-grounded pilot with governed data, explicit tools and representative evaluation.',
    evidence:
      'Input/output contracts, provenance, quality baselines and blocked unsafe-action cases.',
    condition:
      'Advance on representative evidence, not one successful demo. Hold for unbounded tool or data access.',
  },
  {
    prerequisite: 'The pilot has measurable outcomes and known failure cases.',
    deliverable:
      'Durable orchestration, approval paths, verified outcomes and monitored releases.',
    evidence:
      'Interruption, replay, idempotency, parallel completion and incident recovery tests.',
    condition:
      'Advance when controls work under failure. Hold for unverified external effects or unreviewed regressions.',
  },
  {
    prerequisite:
      'Operational ownership and release evidence are sustainable across teams.',
    deliverable:
      'Governed scale and federation with explicit cross-boundary contracts.',
    evidence:
      'Delegation accountability, isolation, resource ceilings and cross-team assurance records.',
    condition:
      'Expand only within reviewed applicability and capacity. Hold any new boundary without an accountable owner.',
  },
];
export const changes = [
  {
    id: 'retrieval',
    name: 'Improve retrieval',
    target: 'knowledge.retrieval-context',
    artifact: 'retrieval',
    proposal:
      'A trace review finds relevant evidence arriving too late in the context. Propose a revised reranker and context budget.',
    mutable:
      'Reranking configuration and context-selection policy on a versioned corpus.',
    protected:
      'Source entitlements, tenant boundaries, citation provenance and safety policy.',
    validation:
      'Held-out grounding tests, retained-task regressions, freshness and permission-denial cases.',
    authority:
      'Governance approves the exact candidate after independent Evaluation evidence and Security review.',
    budget:
      'A declared evaluation budget, bounded search space and limited canary traffic.',
    recovery:
      'Withdraw on grounding regression, provenance loss or any denied-source disclosure; restore the last approved configuration.',
    features: ['B1', 'C6', 'F5', 'F10', 'F11'],
  },
  {
    id: 'memory',
    name: 'Consolidate memory',
    target: 'knowledge.memory-state',
    artifact: 'memory',
    proposal:
      'Repeated episodes contain duplicate or contradictory memories. Propose a provenance-preserving consolidation rule.',
    mutable:
      'Deduplication, summarization and expiration rules for an approved memory partition.',
    protected:
      'Tenant isolation, consent, deletion requests, source provenance and quarantined content.',
    validation:
      'Recall quality, contradiction handling, cross-tenant negative tests and deletion persistence.',
    authority:
      'Governance approves retention-policy changes; Evaluation validates recall; Security checks isolation.',
    budget:
      'Bound records processed per batch and retained size. Stop at the declared resource limit.',
    recovery:
      'Quarantine the new batch and restore compatible records without reviving revoked or deleted facts.',
    features: ['B4', 'B9', 'F5', 'F11'],
  },
  {
    id: 'tools',
    name: 'Refine a tool contract',
    target: 'execution.tool-skill-sandbox',
    artifact: 'tools',
    proposal:
      'Observed failures expose ambiguous tool arguments. Propose a stricter schema and clearer manifest.',
    mutable:
      'Input/output schema and tool description in an isolated candidate release.',
    protected:
      'Authorized operations, target identity, egress bounds and idempotency guarantees.',
    validation:
      'Contract compatibility, malformed payloads, approval replay, duplicate execution and verified outcomes.',
    authority:
      'The tool owner proposes; independent Evaluation supplies evidence; Governance authorizes promotion subject to Security constraints.',
    budget:
      'Sandbox-only validation with synthetic state and no unapproved external writes.',
    recovery:
      'Stop new dispatches, restore compatible contracts and reconcile or compensate effects separately.',
    features: ['A5', 'D4', 'D7', 'D8', 'F9'],
  },
] as const;
export const adaptationBoundaries: Record<string, string> = {
  'runtime.infrastructure':
    'Resource policy and deployment configuration may change within reviewed limits. Isolation, budget ceilings and recovery compatibility remain protected.',
  'runtime.model-inference':
    'Model selection and decoding settings require new quality/safety evidence. Weight changes are a distinct release surface, not an invisible harness tweak.',
  'runtime.ai-gateway':
    'Routing and caching rules may adapt under versioned policy. Identity checks, spending limits and deny decisions cannot be weakened by an optimizer.',
  'runtime.experience':
    'Presentation and clarification prompts can improve. Consent, accessibility and explicit approval meaning must remain intact.',
  'trust.security-safety':
    'Security constrains every change. A proposal cannot grant itself authority or redefine the constraints used to approve it.',
  'trust.governance-agentops':
    'Governance owns promotion authority and the decision record. Changes to that authority require separate authorization.',
  'trust.observability-finops':
    'Telemetry collection and aggregation may be tuned. Preserve outcome provenance, privacy, coverage and resource-limit alerts.',
  'trust.evaluation-assurance':
    'Evaluation supplies independent evidence. Protect held-out tests and calibrate evaluator changes separately from the candidate they judge.',
  'execution.protocol-interoperability':
    'Adapters and schemas may evolve with compatibility tests. Preserve identities, exact payload meaning and target-bound authorization.',
  'execution.orchestration':
    'Workflow and planning policies can be proposed as versioned changes. Preserve checkpoint compatibility, approval gates and termination limits.',
  'execution.tool-skill-sandbox':
    'Tool manifests and implementations can improve in isolation. Preserve least privilege, idempotency, containment and verified external outcomes.',
  'execution.ml-decision':
    'Optimizers can propose candidates and specialist models can change with validation. Neither role grants promotion authority.',
  'knowledge.domain-semantic':
    'Glossary and ontology changes need domain-owner review. Preserve semantic compatibility and propagate changed definitions explicitly.',
  'knowledge.data-integration':
    'Connectors and quality rules can evolve. Data access, freshness, lineage and consent remain enforced at the boundary.',
  'knowledge.retrieval-context':
    'Ranking and context budgets are bounded change surfaces. Grounding, entitlements and citation provenance must survive the change.',
  'knowledge.memory-state':
    'Consolidation, retention and recall policies require evidence. Protect tenant partitions, deletion, consent and quarantine state.',
};
