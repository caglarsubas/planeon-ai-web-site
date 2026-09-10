// Synthetic, localhost-only acceptance surface. Not an application route or production entrypoint.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecipeCanvas } from '../components/site/RecipeCanvas';
import { ThemeToggle } from '../components/site/ThemeToggle';
import { fixture } from '../services/journey-studio/tests/fixture';
import '../app/globals.css';
import '../app/premium.css';
import '../app/theme.css';
import '../app/journey/studio.css';
const root = document.getElementById('studio-qa');
if (root)
  createRoot(root).render(
    <main
      className="studio-designer section-shell"
      style={{ paddingTop: '2rem' }}
    >
      <p>
        Synthetic local acceptance fixture. Not an assistant response or
        customer pack.
      </p>
      <ThemeToggle labeled />
      <RecipeCanvas recipe={fixture().recipe} />
    </main>,
  );
