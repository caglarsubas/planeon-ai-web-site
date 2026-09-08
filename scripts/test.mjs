import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
// Compile the small pure-data/server test surface into a disposable directory.
// No loader dependency, browser credential or live email delivery is required.
const root = path.resolve('.');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'planeon-tests-'));
const files = [
  'lib/harness.ts',
  'lib/scenarios.ts',
  'lib/journey-motion.ts',
  'lib/aml.ts',
  'lib/playground.ts',
  'lib/maturity-levels.ts',
  'lib/navigation.ts',
  'lib/film-playback.ts',
  'lib/consultation-context.ts',
  'lib/evolution.ts',
  'lib/maturity-disclosure.ts',
  'lib/consultation.ts',
  'data/navigation.v1.ts',
  'data/operating.v1.ts',
  'data/evolution.v1.ts',
  'data/maturity-levels.v1.ts',
  'data/research.v1.ts',
  'data/transformation.v1.ts',
  'app/api/consultation/route.ts',
  'app/transformation/route.ts',
  'tests/reference.test.ts',
  'tests/journey-motion.test.ts',
  'tests/consultation.test.ts',
  'tests/visual-system.test.ts',
  'tests/maturity-levels.test.ts',
  'tests/transformation.test.ts',
  'tests/home-film.test.ts',
  'tests/evolution.test.ts',
  'tests/business-entry.test.ts',
  'tests/playground.test.ts',
];
fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"module"}');
fs.cpSync(path.join(root, 'data'), path.join(temp, 'data'), {
  recursive: true,
});
for (const file of files) {
  const destination = path.join(temp, file.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const compiled = ts
    .transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    })
    .outputText.replace(/from (['"])(\.[^'"]+)\1/g, (all, quote, name) =>
      name.endsWith('.json')
        ? `from ${quote}${name}${quote} with { type: 'json' }`
        : `from ${quote}${name.replace(/\.ts$/, '')}.js${quote}`,
    );
  fs.writeFileSync(destination, compiled);
}
const result = spawnSync(
  process.execPath,
  [
    '--test',
    path.join(temp, 'tests/reference.test.js'),
    path.join(temp, 'tests/journey-motion.test.js'),
    path.join(temp, 'tests/consultation.test.js'),
    path.join(temp, 'tests/visual-system.test.js'),
    path.join(temp, 'tests/maturity-levels.test.js'),
    path.join(temp, 'tests/transformation.test.js'),
    path.join(temp, 'tests/home-film.test.js'),
    path.join(temp, 'tests/evolution.test.js'),
    path.join(temp, 'tests/business-entry.test.js'),
    path.join(temp, 'tests/playground.test.js'),
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      RESEND_API_KEY: 'test-only-not-a-real-key',
      CONSULTATION_FROM:
        'Planeon consultation <consultation@notifications.planeon.ai>',
      CONSULTATION_TO: 'caglar.subasi@planeon.ai',
    },
  },
);
process.exitCode = result.status ?? 1;
