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
  'lib/aml.ts',
  'lib/consultation-context.ts',
  'data/operating.v1.ts',
  'data/research.v1.ts',
  'app/api/consultation/route.ts',
  'tests/reference.test.ts',
  'tests/consultation.test.ts',
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
    path.join(temp, 'tests/consultation.test.js'),
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
