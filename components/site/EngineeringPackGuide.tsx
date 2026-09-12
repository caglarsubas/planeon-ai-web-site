/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
export function EngineeringPackGuide() {
  return (
    <>
      <span className="eyebrow">Optional / Engineering pack</span>
      <h2>From visual draft to reviewed files.</h2>
      <p>
        A branded PDF with diagrams, an editable Markdown specification and
        structured recipe JSON. All three describe the same reviewed version.
      </p>
      <ol className="studio-pack-path" aria-label="How to get your files">
        <li>
          <strong>Verify &amp; request</strong>
          <span>
            Use your selected draft. Verify your company inbox, then supply your
            name, company, role, intended use and consent.
          </span>
        </li>
        <li>
          <strong>Prepare &amp; review</strong>
          <span>
            Files are prepared privately. Caglar reviews the exact version
            before anything is released.
          </span>
        </li>
        <li>
          <strong>Download in My requests</strong>
          <span>
            Sign in with the same verified email, open your approved request and
            choose PDF, Markdown or JSON.
          </span>
        </li>
      </ol>
      <p className="studio-fine">
        Email delivery is additional, not the only way to get approved files.
        Downloads need the local service online and remain available until 90
        days after submission. Verification and approval cannot be skipped.
      </p>
      <p>
        <a href="/journey/requests" target="_blank" rel="noopener noreferrer">
          Open My requests (new tab) ↗
        </a>{' '}
        — check progress or return to an approved pack without leaving this
        draft.
      </p>
    </>
  );
}
