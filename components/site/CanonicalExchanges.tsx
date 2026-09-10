/* oxlint-disable next/no-html-link-for-pages -- Preserve canonical step anchors. */
import content from '@/data/content.json';
import { ReferenceDisclosure } from './ReferenceDisclosure';

const exchanges = Object.entries(content.sequence.messageMeta)
  .map(([id, message]) => ({ number: Number(id.slice(1)), ...message }))
  .sort((a, b) => a.number - b.number);

export function CanonicalExchanges() {
  return (
    <ReferenceDisclosure
      id="canonical-exchanges"
      title="Technical reference: the 43 canonical exchanges"
      className="section-shell canonical-exchanges"
    >
      <h2>Only two exchanges cross the model core.</h2>
      <p>
        In this canonical example, messages 16 and 17 are one request/response
        pair—not two model invocations or a universal scenario count. Other
        workflows can repeat, omit or add work.
      </p>
      <p>
        Hover or focus a node for its operation. Open it to inspect the
        corresponding step in the default retail Journey.
      </p>
      <div className="dot-field" aria-label="43 canonical exchanges">
        {exchanges.map((m) => (
          <a
            key={m.number}
            className={[16, 17].includes(m.number) ? 'model-dot' : ''}
            href={`/journey#step-${m.number}`}
            aria-label={`Step ${m.number}: ${m.label}`}
          >
            <b>{String(m.number).padStart(2, '0')}</b>
            <span className="dot-operation" role="tooltip">
              <small>
                {m.from} → {m.to}
              </small>
              {m.label}
            </span>
          </a>
        ))}
      </div>
    </ReferenceDisclosure>
  );
}
