// Import from an operator-supplied document without putting credentials in argv or output.
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { privateDirectory } from './config';
import { importInferenceProfile } from './inference-profile';

process.umask(0o077);
try {
  const document = process.argv[2];
  if (!document || process.argv.length !== 3)
    throw new Error('Missing document.');
  const directory = privateDirectory(
    process.env.STUDIO_DATA_DIR ||
      path.join(homedir(), 'Library/Application Support/Planeon/JourneyStudio'),
  );
  importInferenceProfile(fs.readFileSync(document, 'utf8'), directory);
  console.info(
    'Planeon inference configuration saved privately. Restart the local Studio service to apply it. Email configuration is unchanged.',
  );
} catch {
  console.error(
    'Inference import failed. Check the approved document and private storage permissions. No credential values were logged.',
  );
  process.exitCode = 1;
}
