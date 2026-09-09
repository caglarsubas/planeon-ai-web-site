import PDFDocument from 'pdfkit';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RecipeSnapshot } from '../../../lib/studio/contract';
import { byId, planes } from '../../../lib/harness';
import { features, relation } from '../../../lib/aml';
import { briefFields } from '../../../lib/studio/contract';
import type { RequestProfile } from '../../../lib/studio/account';
import { canonical, StudioError } from './security';

const siteRoot = fileURLToPath(new URL('../../../', import.meta.url));
export type Artifact = {
  name: string;
  type: string;
  bytes: number;
  sha256: string;
};
export type Manifest = {
  version: number;
  snapshotHash: string;
  artifacts: Artifact[];
};
export const hashBytes = (value: Uint8Array | string) =>
  createHash('sha256').update(value).digest('hex');
export function packSections(
  snapshot: RecipeSnapshot,
  profile: RequestProfile,
) {
  const { recipe: r, brief, provenance } = snapshot;
  const lines: { heading: string; paragraphs: string[] }[] = [
    {
      heading: 'Purpose and status',
      paragraphs: [
        r.objective,
        'DESIGN PROPOSAL - not assessed maturity, passed controls, verified performance or regulatory certification. All timings are illustrative. This is the exact prepared version submitted for human review.',
        `Prepared for ${profile.fullName}, ${profile.role}, ${profile.company}. Company and role are self-reported; email verification establishes mailbox access only.`,
        `Intended use: ${profile.intendedUse}`,
      ],
    },
    {
      heading: 'Confirmed workflow brief',
      paragraphs: [
        brief.workflow,
        ...briefFields.map((f) => `${f}: ${brief[f] || 'Not supplied'}`),
        ...brief.facts.map((x) => `Supplied fact: ${x}`),
        ...brief.assumptions.map((x) => `Brief assumption: ${x}`),
        ...brief.unknowns.map((x) => `Missing information: ${x}`),
      ],
    },
    {
      heading: 'Architecture and harness responsibilities',
      paragraphs: r.harnesses.map((id) => {
        const h = byId(id)!;
        return `${h.number}. ${h.shortName} | ${planes[h.plane].name}\n${h.name}\n${h.mandate}\nResponsibilities: ${h.owns.join('; ')}\nReference: https://planeon.ai${h.href}`;
      }),
    },
    ...r.steps.map((s, index) => ({
      heading: `${String(index + 1).padStart(2, '0')} / ${s.title}`,
      paragraphs: [
        `Step ${s.id} | ${s.kind} | ${s.clock} timeline`,
        s.description,
        `Interface: ${byId(s.from)?.shortName || s.from} -> ${byId(s.to)?.shortName || s.to}`,
        `Inputs: ${s.inputs}`,
        `Outputs: ${s.outputs}`,
        `Authorization: ${s.authorization}`,
        `Recovery: ${s.recovery}`,
        `Dependencies: ${s.dependsOn.join(', ') || 'None'}${s.repeatOf ? `; repeated pass of ${s.repeatOf}` : ''}${s.parallelGroup ? `; parallel group ${s.parallelGroup}` : ''}`,
        `Illustrative duration ${s.durationMs} ms. ${s.timingAssumption}`,
        `Harnesses: ${s.harnessIds.map((id) => byId(id)!.shortName).join(', ') || 'No harness handoff'}. AML references: ${s.featureIds.join(', ') || 'None selected'}.`,
      ],
    })),
    {
      heading: 'AML evidence requirements',
      paragraphs: r.evidence.map((e) => {
        const f = features.find((f) => f.id === e.featureId)!;
        return `${f.id} / ${f.name}\n${byId(e.harnessId)!.shortName}: ${relation(f, e.harnessId)} responsibility in the target reference model.\nProposed relevance: ${e.rationale}\nExpected evidence: ${e.expectedEvidence}\nCatalog requirements: ${Array.isArray(f.acceptance_evidence) ? f.acceptance_evidence.join('; ') : f.acceptance_evidence}\nhttps://planeon.ai/maturity?feature=${f.id}#expected-evidence`;
      }),
    },
    {
      heading: 'Assumptions and open questions',
      paragraphs: [
        ...r.assumptions.map((x) => `Assumption: ${x}`),
        ...r.openQuestions.map((x) => `Open: ${x}`),
      ],
    },
    {
      heading: 'Failure and recovery design',
      paragraphs: [
        `Stop future actions: ${r.recovery.stopFutureActions}`,
        `Restore a version: ${r.recovery.restoreVersion}`,
        `Compensate external effects: ${r.recovery.compensateEffects}`,
      ],
    },
    {
      heading: 'Acceptance tests',
      paragraphs: r.acceptanceTests.map((x, i) => `${i + 1}. ${x}`),
    },
    {
      heading: 'Phased implementation',
      paragraphs: r.phases.map(
        (p) =>
          `${p.name}\nPrerequisite: ${p.prerequisite}\nDeliverable: ${p.deliverable}\nRequired evidence: ${p.evidence}\nAdvance / hold: ${p.advanceOrHold}`,
      ),
    },
    {
      heading: 'Provenance and qualifications',
      paragraphs: [
        `Recipe contract: ${provenance.recipeVersion}`,
        `Catalog: ${provenance.catalogVersion}`,
        `Generated: ${provenance.generatedAt}`,
        `Self-hosted model: ${provenance.model}`,
        'References describe requirements, not implementation evidence. Independent evaluation and authorized review remain necessary. Source research PDFs are not redistributed. Files expire 90 days after submission; earlier deletion is available. Deletion cannot remove copies already delivered by email.',
      ],
    },
  ];
  return lines;
}
async function pdf(
  snapshot: RecipeSnapshot,
  profile: RequestProfile,
  version: number,
  hash: string,
) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    bufferPages: true,
    info: {
      Title: snapshot.recipe.title,
      Author: 'Planeon',
      Subject: `Engineering proposal v${version}`,
    },
  });
  const chunks: Buffer[] = [];
  const ready = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.registerFont(
    'Body',
    path.join(siteRoot, 'services/journey-studio/inter-400.ttf'),
  );
  doc.registerFont(
    'Heading',
    path.join(siteRoot, 'services/journey-studio/poppins-600.ttf'),
  );
  const text = (value: string) =>
    Array.from(value)
      .filter((c) => c === '\n' || c === '\t' || c.charCodeAt(0) >= 32)
      .join('');
  doc.image(path.join(siteRoot, 'public/brand/planeon-logo.png'), 48, 38, {
    width: 120,
  });
  doc.y = 98;
  doc
    .font('Body')
    .fontSize(10)
    .fillColor('#3E5F70')
    .text(`ENGINEERING PROPOSAL / VERSION ${version}`);
  doc
    .moveDown()
    .font('Heading')
    .fontSize(25)
    .fillColor('#0A1020')
    .text(text(snapshot.recipe.title));
  doc
    .moveDown()
    .font('Body')
    .fontSize(10)
    .text(`Snapshot SHA-256: ${hash}`, { width: 495 });
  doc
    .moveDown()
    .text(
      'Private prepared documents. Approval is recorded separately; it never changes these bytes.',
    );
  // Compact architecture legend; meaningful plane color, not a decorative chart.
  doc.moveDown();
  for (const [plane, paint] of Object.entries(planes)) {
    const names = snapshot.recipe.harnesses
      .filter((id) => byId(id)!.plane === plane)
      .map((id) => byId(id)!.shortName);
    if (!names.length) continue;
    const y = doc.y;
    doc.circle(53, y + 6, 4).fill(paint.color);
    doc
      .fillColor('#0A1020')
      .text(`${paint.name}: ${names.join(', ')}`, 66, y, { width: 475 });
    doc.moveDown(0.5);
  }
  doc.addPage();
  doc.font('Heading').fontSize(18).text('Workflow at a glance');
  doc
    .moveDown()
    .font('Body')
    .fontSize(10)
    .text(
      'Connector arrows link immediately preceding dependencies. Other prerequisites are named on each node. Parallel groups and separate monitoring/offline timelines are explicitly labeled. This is not measured execution time.',
    );
  for (const clock of ['task', 'continuous', 'offline']) {
    const steps = snapshot.recipe.steps.filter((s) => s.clock === clock);
    if (!steps.length) continue;
    doc
      .moveDown()
      .font('Heading')
      .fontSize(13)
      .text(`${clock.toUpperCase()} TIMELINE`);
    let previousId = '';
    let previousBottom = 0;
    for (const s of steps) {
      const label = text(
        `${s.id} / ${s.title}\n${s.dependsOn.length ? `From ${s.dependsOn.slice(0, 4).join(' + ')}${s.dependsOn.length > 4 ? ` + ${s.dependsOn.length - 4} more (see specification)` : ''}` : 'Start'}${s.parallelGroup ? ` | Parallel: ${s.parallelGroup}` : ''}`,
      );
      const height = Math.max(
        54,
        doc.font('Body').fontSize(10).heightOfString(label, { width: 430 }) +
          20,
      );
      if (doc.y + height + 10 > 780) {
        doc.addPage();
        previousBottom = 0;
      }
      const y = doc.y + 10;
      if (
        s.dependsOn.includes(previousId) &&
        y > previousBottom &&
        previousBottom > 0
      ) {
        const x = 295;
        doc
          .moveTo(x, previousBottom)
          .lineTo(x, y - 2)
          .lineWidth(0.8)
          .stroke('#3E5F70');
        doc
          .moveTo(x - 3, y - 7)
          .lineTo(x, y - 2)
          .lineTo(x + 3, y - 7)
          .stroke('#3E5F70');
      }
      doc.roundedRect(48, y, 495, height, 4).lineWidth(0.6).stroke('#CBD1DC');
      doc
        .font('Body')
        .fontSize(10)
        .fillColor('#0A1020')
        .text(label, 62, y + 10, { width: 465 });
      doc.y = y + height + 8;
      previousId = s.id;
      previousBottom = y + height;
    }
  }
  for (const section of packSections(snapshot, profile)) {
    doc.addPage();
    doc
      .font('Heading')
      .fontSize(18)
      .fillColor('#0A1020')
      .text(text(section.heading));
    doc.moveDown();
    for (const paragraph of section.paragraphs) {
      doc
        .font('Body')
        .fontSize(10.5)
        .fillColor('#0A1020')
        .text(text(paragraph), { width: 495, lineGap: 4 });
      doc.moveDown();
    }
  }
  const range = doc.bufferedPageRange();
  for (let page = 0; page < range.count; page++) {
    doc.switchToPage(page);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font('Body')
      .fontSize(8)
      .fillColor('#3E5F70')
      .text(
        `Planeon / Proposal v${version} / ${page + 1} of ${range.count}`,
        48,
        808,
        { lineBreak: false },
      );
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return ready;
}
export function versionDirectory(
  root: string,
  requestId: string,
  version: number,
) {
  if (
    !/^[a-f0-9-]{36}$/.test(requestId) ||
    !Number.isInteger(version) ||
    version < 1
  )
    throw new StudioError('INVALID_ARTIFACT_PATH');
  return path.join(root, 'packs', requestId, `v${version}`);
}
export async function prepareDocuments(
  root: string,
  requestId: string,
  version: number,
  snapshot: RecipeSnapshot,
  profile: RequestProfile,
): Promise<Manifest> {
  const directory = versionDirectory(root, requestId, version);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const hash = hashBytes(canonical(snapshot));
  const sections = packSections(snapshot, profile);
  const markdown = `# ${snapshot.recipe.title}\n\nVersion ${version} | Snapshot SHA-256: ${hash}\n\n${sections.map((s) => `## ${s.heading}\n\n${s.paragraphs.join('\n\n')}`).join('\n\n')}\n`;
  const files = [
    {
      name: 'recipe.json',
      type: 'application/json',
      bytes: Buffer.from(
        JSON.stringify(
          { documentVersion: version, snapshotHash: hash, ...snapshot },
          null,
          2,
        ),
      ),
    },
    {
      name: 'specification.md',
      type: 'text/markdown',
      bytes: Buffer.from(markdown),
    },
    {
      name: 'engineering-pack.pdf',
      type: 'application/pdf',
      bytes: await pdf(snapshot, profile, version, hash),
    },
  ];
  const artifacts: Artifact[] = [];
  for (const file of files) {
    const destination = path.join(directory, file.name);
    // Only a job in preparing state calls this. Published manifests are never overwritten.
    const temporary = `${destination}.preparing`;
    await fs.writeFile(temporary, file.bytes, { mode: 0o600 });
    await fs.rename(temporary, destination);
    artifacts.push({
      name: file.name,
      type: file.type,
      bytes: file.bytes.length,
      sha256: hashBytes(file.bytes),
    });
  }
  return { version, snapshotHash: hash, artifacts };
}
export async function readArtifact(
  root: string,
  requestId: string,
  manifest: Manifest,
  name: string,
) {
  const artifact = manifest.artifacts.find((a) => a.name === name);
  if (!artifact) throw new StudioError('NOT_FOUND', 404);
  const filename = path.join(
    versionDirectory(root, requestId, manifest.version),
    artifact.name,
  );
  const stat = await fs.lstat(filename);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.size !== artifact.bytes ||
    stat.size > 12_000_000
  )
    throw new StudioError('ARTIFACT_INTEGRITY_FAILED', 409);
  const bytes = await fs.readFile(filename);
  if (hashBytes(bytes) !== artifact.sha256)
    throw new StudioError('ARTIFACT_INTEGRITY_FAILED', 409);
  return { ...artifact, data: bytes };
}
