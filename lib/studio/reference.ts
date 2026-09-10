import { harnesses } from '../harness';
import { features } from '../aml';
import { scenarios } from '../scenarios';

export const studioReferences = [
  ...harnesses.map((h) => ({
    id: h.id,
    kind: 'Harness',
    title: `${h.number}. ${h.shortName}`,
    summary: h.name,
    href: h.href,
    designHref: `/journey?mode=design&harness=${h.id}`,
  })),
  ...features.map((f) => ({
    id: f.id,
    kind: 'AML feature',
    title: `${f.id} · ${f.name}`,
    summary: f.primary_accountability,
    href: `/maturity?feature=${f.id}#expected-evidence`,
    designHref: `/journey?mode=design&feature=${f.id}`,
  })),
  ...scenarios.map((s) => ({
    id: s.id,
    kind: 'Example',
    title: s.title,
    summary: `${s.industry} · ${s.initiated}-initiated`,
    href: `/journey?scenario=${s.id}`,
    designHref: `/journey?mode=design&scenario=${s.id}`,
  })),
];
export function searchStudioReferences(query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.length
    ? studioReferences
        .filter((r) =>
          words.every((w) =>
            `${r.id} ${r.title} ${r.summary}`.toLowerCase().includes(w),
          ),
        )
        .slice(0, 12)
    : [];
}
