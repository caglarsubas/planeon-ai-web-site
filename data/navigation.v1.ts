export const resourceGroups = [
  {
    title: 'Understand the system',
    description: 'The architecture, a practical example and safe improvement.',
    links: [
      [
        '/blueprint',
        'Blueprint',
        'What makes an agent system reliable? Explore sixteen responsibilities around the model.',
      ],
      [
        '/journey',
        'Journey',
        'How does it work in practice? Follow one request from start to confirmed outcome.',
      ],
      [
        '/evolution',
        'Learning & Evolution',
        'How can the system improve safely? Follow a proposed change through independent checks.',
      ],
    ],
  },
  {
    title: 'Inspect the implementation',
    description: 'Working references for architects and engineers.',
    links: [
      [
        '/explorer',
        'Explorer',
        'Inspect all scenarios with onion, sequence, waterfall and layered-flow views.',
      ],
      [
        '/roadmap',
        'Roadmap',
        'Review phases 0–3, their prerequisites, deliverables and evidence gates.',
      ],
    ],
  },
  {
    title: 'Read the research',
    description: 'Source material, qualifications and deeper explanations.',
    links: [
      [
        '/evolution/research',
        'Research',
        'Explore the neuroplasticity metaphor, adaptation patterns, sources and open questions.',
      ],
      [
        '/whitepaper',
        'Whitepaper',
        'Read the executive brief on the enterprise agent operating model.',
      ],
    ],
  },
] as const;
