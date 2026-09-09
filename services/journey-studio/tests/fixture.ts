import {
  emptyBrief,
  recipeProvenance,
  RECIPE_VERSION,
  type RecipeSnapshot,
  type SolutionRecipe,
} from '../../../lib/studio/contract';
export function fixture(): RecipeSnapshot {
  const harnesses = [
    'runtime.experience',
    'trust.security-safety',
    'execution.tool-skill-sandbox',
  ];
  const base = {
    description:
      'Illustrative request; no live business operation is executed.',
    harnessIds: harnesses,
    featureIds: ['A5'],
    kind: 'action' as const,
    clock: 'task' as const,
    parallelGroup: '',
    repeatOf: '',
    inputs: 'Verified request context',
    outputs: 'Typed result with provenance',
    authorization:
      'Verify identity and exact-action authority before mutation.',
    recovery: 'Stop retries and reconcile external state before compensation.',
    durationMs: 40,
    timingAssumption:
      'Illustrative 40 ms teaching value, not measured performance.',
  };
  const recipe: SolutionRecipe = {
    version: RECIPE_VERSION,
    title: 'Illustrative address-change workflow',
    objective: 'Propose a controlled address change after payment.',
    harnesses,
    steps: [
      {
        ...base,
        id: 'receive',
        title: 'Understand the request',
        from: 'user',
        to: 'runtime.experience',
        dependsOn: [],
      },
      {
        ...base,
        id: 'authorize',
        title: 'Authorize this action',
        from: 'runtime.experience',
        to: 'trust.security-safety',
        dependsOn: ['receive'],
        kind: 'approval',
      },
      {
        ...base,
        id: 'apply',
        title: 'Apply the approved change',
        from: 'trust.security-safety',
        to: 'execution.tool-skill-sandbox',
        dependsOn: ['authorize'],
        featureIds: ['A5', 'D7'],
      },
      {
        ...base,
        id: 'verify',
        title: 'Verify the outcome',
        from: 'execution.tool-skill-sandbox',
        to: 'runtime.experience',
        dependsOn: ['apply'],
        featureIds: ['D8'],
      },
    ],
    evidence: [
      {
        featureId: 'A5',
        harnessId: 'trust.security-safety',
        rationale: 'Exact-action authority is needed before mutation.',
        expectedEvidence:
          'A scoped authorization decision linked to the requested action.',
      },
      {
        featureId: 'D7',
        harnessId: 'execution.tool-skill-sandbox',
        rationale: 'External changes need transactional integrity.',
        expectedEvidence:
          'Idempotency, reconciliation and compensation test results.',
      },
      {
        featureId: 'D8',
        harnessId: 'execution.tool-skill-sandbox',
        rationale: 'A tool response is not proof of the final business state.',
        expectedEvidence: 'An independent check of the updated order record.',
      },
    ],
    phases: [
      {
        name: 'Controlled pilot',
        prerequisite: 'Confirm data and approval ownership.',
        deliverable: 'One scoped address-change workflow.',
        evidence: 'Authorization and recovery test results.',
        advanceOrHold: 'Advance only after independent review; otherwise hold.',
      },
    ],
    assumptions: ['The order system exposes a versioned update interface.'],
    openQuestions: ['Who may approve high-value changes?'],
    acceptanceTests: [
      'Reject actions outside the authorized order scope.',
      'Reconcile before retrying a timed-out external mutation.',
    ],
    recovery: {
      stopFutureActions: 'Disable further queued mutations.',
      restoreVersion: 'Restore the last approved workflow configuration.',
      compensateEffects:
        'Reconcile the order and use an authorized compensating action.',
    },
  };
  return {
    recipe,
    brief: {
      ...emptyBrief('Change an order delivery address after payment.'),
      facts: ['Customers request address changes.'],
      unknowns: ['Approval threshold is not yet supplied.'],
    },
    provenance: recipeProvenance('self-hosted-test-fixture'),
  };
}
