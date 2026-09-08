// Planeon service positioning supplied by the user, not a measured delivery benchmark.
// Month ranges are a proposed engagement cadence; the Roadmap owns technical gates.
export const transformationVersion = '2026-09-08.1';
export const transformationScheduleNote =
  'A 12-month target programme, agreed after diagnosis. Scope, data access, integrations, security reviews and your team’s availability shape the schedule. Evidence gates—not the calendar—determine when we advance.';

export const transformationPhases = [
  {
    phase: 0,
    startMonth: 1,
    endMonth: 2,
    title: 'Agree the starting point.',
    work: 'Diagnose maturity, prioritise journeys and establish the identity, data and control foundations before an agent acts.',
    deliverable:
      'An evidence-backed baseline, a scoped roadmap and named owners.',
    gate: 'Agree access, authority boundaries and acceptance criteria.',
  },
  {
    phase: 1,
    startMonth: 3,
    endMonth: 5,
    title: 'Prove a priority journey.',
    work: 'Implement the harness capabilities your first journey needs. Integrate a bounded workflow and test its failure paths with your team.',
    deliverable:
      'A working pilot, reusable contracts and a reviewed evidence pack.',
    gate: 'Demonstrate permitted actions, safe failure and verified outcomes.',
  },
  {
    phase: 2,
    startMonth: 6,
    endMonth: 9,
    title: 'Make production repeatable.',
    work: 'Harden the pilot for real users and extend to the next prioritised journeys. Add capacity, recovery, observability and release discipline.',
    deliverable:
      'Production-ready journeys, operating runbooks and accountable support.',
    gate: 'Validate reliability, security, quality and recovery under realistic conditions.',
  },
  {
    phase: 3,
    startMonth: 10,
    endMonth: 12,
    title: 'Scale the complete system.',
    work: 'Connect reusable capabilities across teams and journeys. Complete the agreed harness scope and establish a governed improvement cycle.',
    deliverable:
      'An integrated agentic harness system and a jointly owned improvement backlog.',
    gate: 'Confirm cross-team controls, operational ownership and rollout evidence.',
  },
] as const;

export const transformationPartners = [
  {
    role: 'Domain experts',
    title: 'Consultancy grounded in your work.',
    description:
      'Translate industry realities, business rules and consequential decisions into the right journeys, controls and acceptance criteria. Your domain owners stay involved throughout.',
  },
  {
    role: 'Forward-deployed engineers',
    title: 'Implementation alongside your team.',
    description:
      'Work directly with your engineers to build harnesses, connect systems and prove behaviour in your environment. Pairing, documentation and knowledge transfer build lasting internal capability.',
  },
  {
    role: 'Long-term partnership',
    title: 'Improvement beyond the first release.',
    description:
      'Keep the roadmap alive through regular evidence reviews, operational learning and new priority journeys. We remain focused on the system’s next useful improvement, not just its launch.',
  },
] as const;
