// One-time, reproducible data extraction. Only literal AST nodes are accepted;
// supplied HTML is never executed and no external resources are loaded.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';

const [onionPath, mappingPath, researchPath] = process.argv.slice(2);
if (!onionPath || !mappingPath || !researchPath)
  throw new Error('Supply onion HTML, mapping JSON and research HTML paths.');
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken
  )
    return -literal(node.operand);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((p) => {
        if (!ts.isPropertyAssignment(p))
          throw new Error('Non-literal property');
        return [p.name.text, literal(p.initializer)];
      }),
    );
  throw new Error(`Non-literal input: ${node.getText().slice(0, 90)}`);
}
function declarations(file, names) {
  const html = fs.readFileSync(file, 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((x) => x[1])
    .join('\n');
  const tree = ts.createSourceFile(
    file,
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const found = {};
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      names.includes(node.name.getText(tree))
    )
      found[node.name.getText(tree)] = literal(node.initializer);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  for (const name of names)
    if (!(name in found)) throw new Error(`Missing ${name}`);
  return found;
}
const onion = declarations(onionPath, [
  'MSGS',
  'SCENARIOS',
  'TICKS',
  'XMSGS',
  'TRIGMSG',
  'DIALOG',
  'INTENT',
  'GENERIC_PASS2',
]);
const research = declarations(researchPath, ['DATA']).DATA;
const aml = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const sha = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const output = path.resolve('data/reference');
fs.mkdirSync(output, { recursive: true });
for (const [name, value] of Object.entries({
  'scenarios.v1.json': {
    version: '2026-09-07.1',
    source: 'harness_onion_animated.html',
    sourceSha256: sha(onionPath),
    scenarios: onion.SCENARIOS,
    messages: onion.MSGS,
    ticks: onion.TICKS,
    clarification: onion.XMSGS,
    trigger: onion.TRIGMSG,
    dialogue: onion.DIALOG,
    intent: onion.INTENT,
    secondPass: onion.GENERIC_PASS2,
  },
  'aml.v1.json': {
    ...aml,
    version: '2026-09-07.1',
    sourceSha256: sha(mappingPath),
  },
  'research.v1.json': {
    version: '2026-09-07.1',
    source: 'neuroplastic-harness-explorer.html',
    sourceSha256: sha(researchPath),
    data: research,
  },
  'selection-index.v1.json': {
    scenarios: onion.SCENARIOS.map(({ id, title, initiated }) => ({
      id,
      title,
      initiated,
    })),
    features: aml.features.map(({ id, name }) => ({ id, name })),
  },
}))
  fs.writeFileSync(
    path.join(output, name),
    JSON.stringify(value, null, 2) + '\n',
  );
console.log(
  JSON.stringify({
    scenarios: onion.SCENARIOS.length,
    features: aml.features.length,
    researchSections: Object.keys(research),
  }),
);
