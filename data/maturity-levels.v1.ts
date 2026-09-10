// Source-derived capability descriptions; curated evidence links are not scoring gates.
// Full source hashes and editorial decisions: docs/MATURITY_LEVELS_REVIEW.md.
export const maturityLevelsVersion = '2026-09-08.1';

export const maturityLevelSources = [
  {
    id: 'aml-framework',
    title: 'The Agentic Maturity Level (AML) Framework',
    location:
      'Framework overview and level deep dives, slides 2, 5–11; synthesis, slide 21.',
  },
  {
    id: 'prometa-executive-v33',
    title: 'Prometa Executive Deck v33',
    location:
      'Five-level experience progression and separate quality/security dimensions, slide 5.',
  },
] as const;

export const maturityLevels = [
  {
    id: 'L1',
    name: 'FAQ / Search',
    mode: 'Read-only answers',
    promise: 'I get quick answers.',
    capability:
      'Retrieves information from approved knowledge sources and explains it. The system answers a question; it does not change a record or initiate a transaction.',
    authority:
      'Read-only. No transactional tools or write access. Sensitive-data protection and source checks still apply.',
    example:
      '“Can I change a delivery address?” The assistant explains the policy and points to its source.',
    evidence: [
      {
        feature: 'B1',
        label: 'Grounded answers',
        question: 'Does the answer follow the supplied evidence?',
      },
      {
        feature: 'B8',
        label: 'Source provenance',
        question: 'Are the sources authorized, current and traceable?',
      },
      {
        feature: 'A1',
        label: 'Sensitive-data protection',
        question: 'Is sensitive information handled for an allowed purpose?',
      },
    ],
  },
  {
    id: 'L2',
    name: 'Knows Me',
    mode: 'Personal context',
    promise: 'I get personalized answers.',
    capability:
      'Uses authorized customer data and context to answer for this person, not just in general. Personalization adds relevance without adding permission to act.',
    authority:
      'Read-only access to the right person’s information. Identity, isolation, consent and memory boundaries must be enforced.',
    example:
      '“Can I change the address on my order?” The assistant checks your order status and explains your options, without changing it.',
    evidence: [
      {
        feature: 'A10',
        label: 'Identity & isolation',
        question: 'Can this user access only the correct account and records?',
      },
      {
        feature: 'B4',
        label: 'Personalization memory',
        question: 'If context persists, is its retention and use governed?',
      },
      {
        feature: 'A8',
        label: 'Consent & revocation',
        question: 'Can the person withdraw purpose-bound consent?',
      },
    ],
  },
  {
    id: 'L3',
    name: 'Gets Things Done',
    mode: 'Confirmed actions',
    promise: 'I get things done.',
    capability:
      'Completes a single user-requested task end to end. It clarifies intent, uses the necessary tools and verifies the result rather than merely suggesting an action.',
    authority:
      'User confirmation before writes. Bind approval to the exact action, target and limits; recover safely from partial failure.',
    example:
      '“Change this order’s delivery address.” The assistant confirms the exact change, updates the order and verifies the saved address.',
    evidence: [
      {
        feature: 'A5',
        label: 'Exact-action authority',
        question:
          'Does approval cover this action, target and amount or scope?',
      },
      {
        feature: 'D7',
        label: 'Transactional integrity',
        question:
          'Are retries, duplicate writes and compensation handled safely?',
      },
      {
        feature: 'D8',
        label: 'Verified outcomes',
        question:
          'Was the external result checked, not just the tool response?',
      },
    ],
  },
  {
    id: 'L4',
    name: 'Journey Orchestrator',
    mode: 'Coordinated journeys',
    promise: 'I solve complex problems.',
    capability:
      'Coordinates a multi-step outcome across products, tools or agents. Dependencies, shared state, approval waits and recovery become part of the workflow.',
    authority:
      'Policy checks across the whole journey and at action boundaries. Delegation does not transfer accountability or bypass required approvals.',
    example:
      '“Resolve my disrupted delivery.” The assistant coordinates the order, stock and carrier, seeking approval for any charge or substitution.',
    evidence: [
      {
        feature: 'D2',
        label: 'Multi-tool composition',
        question:
          'Do dependent steps execute with the correct inputs and order?',
      },
      {
        feature: 'E7',
        label: 'Delegation accountability',
        question:
          'Are delegated responsibilities and completion conditions explicit?',
      },
      {
        feature: 'E6',
        label: 'Failure recovery',
        question:
          'Can the journey resume or hand off safely after interruption?',
      },
    ],
  },
  {
    id: 'L5',
    name: 'Proactive Co-Pilot',
    mode: 'Delegated initiative',
    promise: 'I have a partner.',
    capability:
      'Monitors relevant events and initiates useful work without a fresh prompt, within an agreed mandate. It optimizes the outcome inside those boundaries—not its own authority.',
    authority:
      'Explicit, revocable delegation with policy, resource and time limits. Preventive controls, monitoring, human interruption and audit remain active.',
    example:
      '“Watch my deliveries under these rules.” The assistant detects a delay and arranges an allowed alternative; exceptions return to you for approval.',
    evidence: [
      {
        feature: 'E2',
        label: 'Proactive initiation',
        question:
          'Is initiating this work useful and covered by the user’s consent?',
      },
      {
        feature: 'E8',
        label: 'Resource & stop limits',
        question:
          'Are budgets, termination conditions and backpressure enforced?',
      },
      {
        feature: 'A13',
        label: 'Human interruption',
        question: 'Can a person stop future actions and contain an incident?',
      },
    ],
  },
] as const;

export type MaturityLevel = (typeof maturityLevels)[number];
export type MaturityLevelId = MaturityLevel['id'];
