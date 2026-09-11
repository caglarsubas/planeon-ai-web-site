import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers the top-level promise. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fixture } from './fixture';
import {
  prepareDocuments,
  packSections,
  versionDirectory,
  hashBytes,
} from '../src/documents';

test('PDF flows across sections with bookmarks; all three documents preserve the same proposal', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'planeon-document-test-'),
  );
  const id = randomUUID();
  const snapshot = fixture();
  const profile = {
    fullName: 'Synthetic Visitor',
    company: 'Test Only',
    role: 'Reviewer',
    intendedUse: 'Document QA only.',
    consent: true as const,
    confirmed: true as const,
  };
  try {
    const manifest = await prepareDocuments(root, id, 1, snapshot, profile);
    const directory = versionDirectory(root, id, 1);
    const json = JSON.parse(
      await fs.readFile(path.join(directory, 'recipe.json'), 'utf8'),
    );
    assert.deepEqual(json.recipe, snapshot.recipe);
    assert.deepEqual(json.brief, snapshot.brief);
    assert.equal(json.snapshotHash, manifest.snapshotHash);
    const md = await fs.readFile(
      path.join(directory, 'specification.md'),
      'utf8',
    );
    for (const section of packSections(snapshot, profile)) {
      assert(md.includes(section.heading));
      for (const paragraph of section.paragraphs)
        assert(md.includes(paragraph));
    }
    const pdf = await fs.readFile(path.join(directory, 'engineering-pack.pdf'));
    const source = pdf.toString('latin1');
    const pages = source.match(/\/Type \/Page\b/g)?.length || 0;
    assert(
      pages >= 3 && pages <= 9,
      `Expected compact flowing PDF, got ${pages} pages`,
    );
    assert.match(source, /\/Outlines\b/);
    for (const artifact of manifest.artifacts) {
      assert.equal(
        hashBytes(await fs.readFile(path.join(directory, artifact.name))),
        artifact.sha256,
      );
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
