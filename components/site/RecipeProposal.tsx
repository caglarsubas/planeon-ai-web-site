'use client';
import { useState } from 'react';
import { recipeChanges, type SolutionRecipe } from '@/lib/studio/contract';
import { RecipeCanvas } from './RecipeCanvas';

/** A preview is not an application or an approval of the proposed version. */
export function RecipeProposal({
  recipe,
  current,
  changeSummary,
  active = true,
  onApply,
  onDiscard,
}: {
  recipe: SolutionRecipe;
  current?: SolutionRecipe;
  changeSummary: string[];
  active?: boolean;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const [inspectRevision, setInspectRevision] = useState(false);
  const diff = current ? recipeChanges(current, recipe) : null;
  return (
    <section
      className="studio-revision"
      id="proposed-solution"
      aria-label="Proposed design revision"
    >
      <span className="eyebrow">03 / Inspect your proposed solution</span>
      <h2>
        {current
          ? 'A proposed revision is ready.'
          : 'Your draft, inside the architecture.'}
      </h2>
      <p>
        {current
          ? 'Compare this revision with your selected draft. The selected version stays unchanged until you apply it.'
          : 'Follow the proposed handoffs through the same harness-onion used in Explore an example. Select a harness to inspect its responsibilities and AML evidence needs.'}
      </p>
      <div className="studio-actions">
        <button className="studio-primary" onClick={onApply}>
          {current ? 'Apply this revision' : 'Use this draft'}
        </button>
        <a href="#engineering-pack">Get PDF, Markdown &amp; JSON →</a>
        <button onClick={onDiscard}>Discard proposal</button>
      </div>
      <p className="studio-fine">
        Preview only—not an approved design. Using a draft selects it for
        refinement and a private pack request; it does not release files.
      </p>
      {diff && (
        <div className="studio-diff">
          {(['added', 'removed', 'changed'] as const).map((key) => (
            <div key={key}>
              <h3>{key} steps</h3>
              <ul>
                {diff[key].length ? (
                  diff[key].map((x) => <li key={x}>{x}</li>)
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
          ))}
          <p>
            Other changes:{' '}
            {Object.entries(diff)
              .filter(([k, v]) => k.endsWith('Changed') && v)
              .map(([k]) => k.replace('Changed', ''))
              .join(', ') || 'none'}
            .
          </p>
        </div>
      )}
      {changeSummary.length > 0 && (
        <details>
          <summary>Assistant’s change summary</summary>
          <p className="studio-fine">
            Inspect the actual proposal; this summary is not verification.
          </p>
          <ul>
            {changeSummary.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </details>
      )}
      {current ? (
        <details
          onToggle={(event) => setInspectRevision(event.currentTarget.open)}
        >
          <summary>Preview the revised onion and steps</summary>
          {inspectRevision && <RecipeCanvas recipe={recipe} active={active} />}
        </details>
      ) : (
        <RecipeCanvas recipe={recipe} active={active} />
      )}
    </section>
  );
}
