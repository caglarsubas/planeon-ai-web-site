import {
  RECIPE_VERSION,
  type AssistantTurn,
} from '../../../lib/studio/contract';

// A complete teaching example, never a fallback response or a submitted customer recipe.
export const inferenceExample: AssistantTurn = {
  reply:
    'This is a proposed control design for review, not a deployed or assessed capability.',
  questions: [],
  brief: null,
  changeSummary: [],
  recipe: {
    version: RECIPE_VERSION,
    title: 'Illustrative internal publication approval',
    objective:
      'Obtain action-bound authority before publishing an internal document.',
    harnesses: ['runtime.experience', 'trust.security-safety'],
    steps: [
      {
        id: 's1',
        title: 'Receive the publication request',
        description: 'Collect the document version and intended audience.',
        from: 'user',
        to: 'runtime.experience',
        harnessIds: ['runtime.experience'],
        featureIds: [],
        dependsOn: [],
        kind: 'action',
        clock: 'task',
        parallelGroup: '',
        repeatOf: '',
        inputs: 'Document reference and intended audience.',
        outputs: 'A scoped request ready for approval.',
        authorization: 'Require the requester to be authenticated.',
        recovery:
          'Ask for clarification if the document reference is ambiguous.',
        durationMs: 1000,
        timingAssumption:
          'Illustrative playback duration only, not measured latency.',
      },
      {
        id: 's2',
        title: 'Authorize the exact publication',
        description:
          'Bind the reviewer decision to the document version and audience.',
        from: 'runtime.experience',
        to: 'trust.security-safety',
        harnessIds: ['runtime.experience', 'trust.security-safety'],
        featureIds: ['A5'],
        dependsOn: ['s1'],
        kind: 'approval',
        clock: 'task',
        parallelGroup: '',
        repeatOf: '',
        inputs: 'Request scope and reviewer identity.',
        outputs: 'An approval decision with an expiry and payload binding.',
        authorization: 'A designated reviewer must approve before publication.',
        recovery: 'Hold the request if approval expires or is revoked.',
        durationMs: 2000,
        timingAssumption:
          'Illustrative wait; actual human response time is unknown.',
      },
    ],
    evidence: [
      {
        featureId: 'A5',
        harnessId: 'trust.security-safety',
        rationale:
          'Publication authority must match the exact document and audience.',
        expectedEvidence:
          'Tests reject changed payloads, expired approvals and replayed decisions.',
      },
    ],
    phases: [
      {
        name: 'Controlled pilot',
        prerequisite: 'Agree document ownership and approval policy.',
        deliverable: 'An independently reviewed approval path.',
        evidence: 'Scoped authorization and failure tests.',
        advanceOrHold:
          'Advance only after the owner reviews evidence; otherwise hold.',
      },
    ],
    assumptions: ['The document store supports immutable version references.'],
    openQuestions: ['Who may authorize publication for each audience?'],
    acceptanceTests: [
      'Reject a publication request after the approval scope changes.',
    ],
    recovery: {
      stopFutureActions: 'Suspend pending publication requests.',
      restoreVersion: 'Restore the last approved workflow configuration.',
      compensateEffects:
        'If publication occurred, reconcile the audience and obtain authority for withdrawal.',
    },
  },
};
