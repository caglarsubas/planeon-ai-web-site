import type { Metadata } from 'next';
/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import content from '@/data/content.json';
import { FailureDemo } from '@/components/site/FailureDemo';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';
import { BlueprintOnion } from '@/components/site/BlueprintOnion';
import {
  OpsComparison,
  ReleaseBundle,
} from '@/components/site/OperatingFoundations';
import { harnesses } from '@/lib/harness';
import { Surface } from '@/components/site/VisualPrimitives';

export const metadata: Metadata = {
  title: 'The Sixteen-Harness Blueprint',
  description:
    'Sixteen accountable boundaries across runtime, knowledge, execution, and trust.',
};

const planeOrder = ['runtime', 'trust', 'execution', 'knowledge'] as const;

export default function BlueprintPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Blueprint / 16 harnesses"
        title="Intelligence needs an operating system."
        description="The blueprint separates enterprise multi-agent capability into sixteen accountable boundaries. Each has a mandate, an owner, interfaces, risks, and observable proof that it works."
      />
      <BlueprintOnion />
      <section
        className="operational-intro section-shell"
        id="operating-responsibilities"
      >
        <div className="section-number">OPERATING RESPONSIBILITIES</div>
        <h2>Control the whole release.</h2>
        <OpsComparison />
      </section>
      <ReleaseBundle />
      <section
        className="blueprint-map section-shell"
        aria-label="Sixteen harnesses grouped by concern"
      >
        {planeOrder.map((plane) => (
          <section key={plane} className={`blueprint-plane plane-${plane}`}>
            <Surface>
              <header>
                <span>{planeOrder.indexOf(plane) + 1}</span>
                <div>
                  <p>Concern plane</p>
                  <h2>{content.planes[plane].label}</h2>
                </div>
              </header>
              <div className="blueprint-list">
                {harnesses
                  .filter((harness) => harness.plane === plane)
                  .map((harness) => (
                    <a
                      key={harness.n}
                      href={`/blueprint/${harness.n}`}
                      className="blueprint-row"
                    >
                      <span className="harness-number">
                        {String(harness.number).padStart(2, '0')}
                      </span>
                      <div>
                        <h3>{harness.name}</h3>
                        <p>{harness.q}</p>
                      </div>
                      <span className="phase-label">Phase {harness.phase}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
              </div>
            </Surface>
          </section>
        ))}
      </section>
      <section className="blueprint-principle section-shell">
        <div className="section-number">THE BOUNDARY PRINCIPLE</div>
        <blockquote>
          Separate the jobs that fail differently, change at different speeds,
          or answer to different owners.
        </blockquote>
        <p>
          The harnesses are not products and the planes are not deployment
          layers. They are a vocabulary for deciding where a responsibility
          belongs—and where evidence must cross a boundary.
        </p>
      </section>
      <FailureDemo />
    </SiteFrame>
  );
}
