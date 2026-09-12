// Synthetic, localhost-only acceptance surface. Not an application route or production entrypoint.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RecipeCanvas } from '../components/site/RecipeCanvas';
import { RecipeProposal } from '../components/site/RecipeProposal';
import { EngineeringPackGuide } from '../components/site/EngineeringPackGuide';
import { StudioPackRequest } from '../components/site/StudioPackRequest';
import { ThemeToggle } from '../components/site/ThemeToggle';
import { fixture } from '../services/journey-studio/tests/fixture';
import '../app/globals.css';
import '../app/premium.css';
import '../app/theme.css';
import '../app/journey/studio.css';
const root = document.getElementById('studio-qa');
function VisualAcceptance() {
  const [proposed, setProposed] = useState(fixture().recipe);
  const [applied, setApplied] = useState<typeof proposed | null>(null);
  const [pending, setPending] = useState(true);
  return (
    <main
      className="studio-designer section-shell"
      style={{ paddingTop: '2rem' }}
    >
      <p>
        Synthetic local acceptance fixture. Not an assistant response or
        customer pack.
      </p>
      <ThemeToggle labeled />
      <button
        onClick={() => {
          setProposed({
            ...fixture().recipe,
            title: 'Synthetic proposed revision',
          });
          setPending(true);
        }}
      >
        Propose a synthetic revision
      </button>
      {pending && (
        <RecipeProposal
          key={proposed.title}
          recipe={proposed}
          current={applied || undefined}
          changeSummary={[]}
          onApply={() => {
            setApplied(proposed);
            setPending(false);
          }}
          onDiscard={() => setPending(false)}
        />
      )}
      {applied && (
        <RecipeCanvas key={applied.title} recipe={applied} active={!pending} />
      )}
      {applied ? (
        <StudioPackRequest
          signed={{
            snapshot: { ...fixture(), recipe: applied },
            signature: 'synthetic-preview-not-valid-for-submission',
          }}
        />
      ) : (
        <section className="studio-pack" id="engineering-pack">
          <EngineeringPackGuide />
          <p>
            Use this synthetic draft to inspect the real verification interface.
            This unsigned fixture cannot submit a pack.
          </p>
        </section>
      )}
    </main>
  );
}
if (root) createRoot(root).render(<VisualAcceptance />);
