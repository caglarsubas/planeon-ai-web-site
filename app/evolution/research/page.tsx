/* oxlint-disable next/no-html-link-for-pages -- Native links preserve Sites navigation and deep links. */
import { SiteFrame } from '@/components/site/SiteFrame';
import {
  adaptationPermissions,
  analogies,
  catalogue,
  changeSurfaces,
  metrics,
  patterns,
  researchQuestions,
  researchVersion,
} from '@/data/research.v1';
export const metadata = {
  title: 'Research & interpretation | Planeon',
  description:
    'Primary sources, research horizons and explicit boundaries for governed adaptation.',
};
export default function Research() {
  return (
    <SiteFrame className="reference-page">
      <div className="section-shell">
        <header className="workspace-heading">
          <p className="eyebrow">Research / Beyond the core explanation</p>
          <h1>
            Explore the frontier.
            <br />
            Keep the evidence in view.
          </h1>
          <p>
            Governed adaptation connects practical release discipline with
            research on memory, learning and system evolution. This guide
            separates the design proposal from what any cited experiment or
            product actually establishes.
          </p>
        </header>
        <nav className="research-toc" aria-label="Research contents">
          {[
            ['metaphor', 'The metaphor'],
            ['surfaces', 'Change surfaces'],
            ['patterns', 'Design patterns'],
            ['metrics', 'Measurement'],
            ['catalogue', 'Systems & sources'],
            ['horizons', 'Open questions'],
            ['survey-context', 'Survey context'],
            ['sources', 'Provenance'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label} ↗
            </a>
          ))}
        </nav>
        <p className="reference-caveat">
          Research maturity, AML maturity, implementation readiness, adaptation
          permission and Roadmap phases are different concepts. No figure here
          is a Planeon benchmark, certification or assessment result.{' '}
          <a href="/evolution">Return to the operational explainer ↗</a>
        </p>
        <section className="research-section" id="metaphor">
          <p className="eyebrow">A design metaphor</p>
          <h2>
            “Neuroplasticity” is an analogy,
            <br />
            not an architecture specification.
          </h2>
          <p>
            Biology offers questions about adaptation and stability. It does not
            demonstrate that a software harness is a brain, or that changing a
            prompt reproduces a biological learning mechanism. The translations
            below are engineering interpretations.
          </p>
          <div className="research-rows">
            {analogies.map(([name, description]) => (
              <details key={name}>
                <summary>{name}</summary>
                <p>{description}</p>
              </details>
            ))}
          </div>
          <p className="reference-links">
            <a href="https://arxiv.org/abs/1804.02464">
              Differentiable plasticity: a specific computational research
              formulation ↗
            </a>
            <a href="https://proceedings.mlr.press/v70/zenke17a.html">
              Synaptic Intelligence: continual-learning research ↗
            </a>
            <a href="https://www.nature.com/articles/nature14422">
              Robots that can adapt like animals: an embodied experiment ↗
            </a>
          </p>
        </section>
        <section className="research-section" id="surfaces">
          <p className="eyebrow">What changes / Who permits it</p>
          <h2>A surface is not a permission.</h2>
          <p>
            Task-local state, persistent knowledge and a new release have
            different lifecycles. Monitoring may propose a later change; it does
            not silently extend the live task’s authority.
          </p>
          <div className="research-rows">
            {changeSurfaces.map(([name, scope, boundary]) => (
              <details key={name}>
                <summary>
                  {name} · {scope}
                </summary>
                <p>{boundary}</p>
              </details>
            ))}
          </div>
          <details className="research-permissions">
            <summary>Optional L0–L5 adaptation vocabulary</summary>
            <p className="reference-caveat">
              These labels are a proposed design vocabulary, not AML levels, a
              legal classification or an assertion that more autonomy is better.
              Applicability and approval must be decided for the particular
              system.
            </p>
            <dl>
              {adaptationPermissions.map(([name, description]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </details>
          <a className="text-link" href="/evolution#change-envelope">
            Use an explicit change envelope ↗
          </a>
        </section>
        <section className="research-section" id="patterns">
          <p className="eyebrow">Architectural recommendations</p>
          <h2>Eleven patterns for a bounded change.</h2>
          <p>
            These are Planeon’s synthesis, not universal laws or a compliance
            checklist. Their authoritative operational home is the{' '}
            <a className="text-link" href="/evolution">
              governed change flow
            </a>
            .
          </p>
          <div className="research-rows">
            {patterns.map(([name, description], i) => (
              <details key={name}>
                <summary>
                  {String(i + 1).padStart(2, '0')} · {name}
                </summary>
                <p>{description}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="research-section" id="metrics">
          <p className="eyebrow">
            A measurement specification, not measured results
          </p>
          <h2>Test improvement from more than one direction.</h2>
          <p>
            Choose metrics that match the change and risk. Publish baselines,
            versions, denominators and uncertainty. A better average does not
            excuse a failed mandatory control.
          </p>
          <div className="research-rows">
            {metrics.map(([name, description]) => (
              <details key={name}>
                <summary>{name}</summary>
                <p>{description}</p>
              </details>
            ))}
          </div>
          <div className="reference-links">
            <a href="/maturity?feature=F10">
              F10 · Evaluation validity and adversarial robustness ↗
            </a>
            <a href="/roadmap#operational-dimensions">
              Five operational monitoring perspectives ↗
            </a>
          </div>
        </section>
        <section className="research-section" id="catalogue">
          <p className="eyebrow">
            35 selected entries / Primary-source reading guide
          </p>
          <h2>Related work, with its boundaries intact.</h2>
          <p>
            A paper, developer report and product manual establish different
            things. Inclusion is not an endorsement, independent replication or
            evidence that the approach is deployed in Planeon. Benchmark gains
            and maturity rankings from the supplied synthesis are intentionally
            not reproduced.
          </p>
          <div className="research-catalogue">
            {Array.from(new Set(catalogue.map((item) => item[1]))).map(
              (group) => (
                <details key={group}>
                  <summary>
                    {group}{' '}
                    <span>
                      {catalogue.filter((item) => item[1] === group).length}{' '}
                      entries
                    </span>
                  </summary>
                  <ul>
                    {catalogue
                      .filter((item) => item[1] === group)
                      .map(([title, , url, type]) => (
                        <li key={url}>
                          <a href={url}>{title} ↗</a>
                          <small>{type}</small>
                        </li>
                      ))}
                  </ul>
                </details>
              ),
            )}
          </div>
          <p className="reference-links">
            <a href="https://arxiv.org/abs/2309.02427">
              CoALA: Cognitive Architectures for Language Agents ↗
            </a>
            <a href="https://arxiv.org/abs/2508.07407">
              A comprehensive survey of self-evolving AI agents ↗
            </a>
            <a href="https://arxiv.org/abs/2507.21046">
              What, when, how and where: a self-evolving agent survey ↗
            </a>
          </p>
        </section>
        <section className="research-section" id="horizons">
          <p className="eyebrow">
            Open research questions / No delivery dates implied
          </p>
          <h2>What remains unresolved?</h2>
          <p>
            Nearer-term engineering focuses on reproducibility, memory integrity
            and independent evaluation. Broader structural search and changes to
            the improvement mechanism raise further questions. These are
            research directions, not phases or commitments in Planeon’s delivery
            roadmap.
          </p>
          <ol className="research-questions">
            {researchQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
        <section className="research-section" id="survey-context">
          <p className="eyebrow">
            Reported observations / Source-specific context
          </p>
          <h2>Useful signals. Not universal constants.</h2>
          <div className="research-rows">
            <article>
              <h3>Monitoring coverage</h3>
              <p>
                Gravitee’s 2026 vendor survey reports an average of 47.1% of
                respondents’ organizational AI agents actively monitored or
                secured. This is survey-reported coverage, not a measured global
                population rate.
              </p>
              <a
                className="text-link"
                href="https://www.gravitee.io/hubfs/Downloadable%20Resource/state_of_ai_agent_security_report_pdf_2026.pdf"
              >
                Original report, page 4 ↗
              </a>
            </article>
            <article>
              <h3>Identity visibility</h3>
              <p>
                A May 2026 CSA AI-assisted rapid-research report cites survey
                findings that 68% of agent-using organizations could not clearly
                distinguish agent from human activity. It is cited here as
                reported context, not independent corroboration of the other
                sources; examine the underlying survey references before reuse.
              </p>
              <a
                className="text-link"
                href="https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/ai-agent-identity-nvd-visibility-crisis-v1-csa-styled.pdf"
              >
                CSA report and underlying references, page 4 ↗
              </a>
            </article>
            <article>
              <h3>Agent economics</h3>
              <p>
                Anthropic describes about 15× chat-token usage for multi-agent
                systems in its own research-system data. The workload and
                architecture matter; this is neither a general agent multiplier
                nor a default assumption in Planeon’s readiness calculator.
              </p>
              <a
                className="text-link"
                href="https://www.anthropic.com/engineering/multi-agent-research-system"
              >
                Anthropic’s implementation report ↗
              </a>
            </article>
          </div>
        </section>
        <section className="research-section" id="sources">
          <p className="eyebrow">Provenance / Revision {researchVersion}</p>
          <h2>
            Trace the source.
            <br />
            Name the interpretation.
          </h2>
          <p>
            The website combines the supplied architecture content, animated
            scenario reference, AML mapping, DevOps-to-AgentOps deck,
            governed-evolution report and neuroplastic harness synthesis. Those
            materials informed the design; agreement among AI-generated reports
            is source coverage, not independent scientific confirmation.
          </p>
          <p>
            Scenario outcomes and waterfall durations are illustrative. AML
            relationships are a target reference model: 57 primary owners and
            298 contributors, with evidence reused by reference rather than
            counted again. The complete mapping and source hashes are versioned
            with the site.
          </p>
          <p>
            Primary-source records in this guide were reviewed on 7 September
            2026. Read the original version, setting and limitations before
            applying a research result. Research PDFs are linked at their
            publishers; no copies are hosted here.
          </p>
          <p>
            This website does not determine regulatory applicability or
            establish legal compliance. The change-envelope format is a design
            aid. Formal obligations require a separate, context-specific review;
            no proposed adaptation level is presented as a legal requirement.
          </p>
          <div className="reference-links">
            <a href="https://www.nist.gov/itl/ai-risk-management-framework">
              NIST AI Risk Management Framework: original framework and
              resources ↗
            </a>
            <a href="/maturity">Inspect the target reference mapping ↗</a>
            <a href="/assessment#professional-assessment">
              Discuss an evidence-based professional assessment ↗
            </a>
          </div>
        </section>
      </div>
    </SiteFrame>
  );
}
