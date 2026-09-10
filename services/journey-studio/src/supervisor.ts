// Opt-in, foreground local supervisor. Does not install an OS daemon or cloud resource.
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let child: ChildProcess | null = null;
let stopping = false;
let failures = 0;
let restart: ReturnType<typeof setTimeout> | null = null;
function start() {
  const started = Date.now();
  child = spawn(
    process.execPath,
    ['--import', 'tsx', fileURLToPath(new URL('./main.ts', import.meta.url))],
    {
      stdio: 'inherit',
      shell: false,
      env: process.env,
    },
  );
  child.on('exit', () => {
    child = null;
    if (stopping) return;
    failures = Date.now() - started > 300_000 ? 1 : failures + 1;
    if (failures > 5) {
      console.error(
        'Studio stopped after repeated failures. Check the local configuration; private records were not logged.',
      );
      process.exitCode = 1;
      return;
    }
    const delay = Math.min(30_000, 1000 * 2 ** failures);
    console.info('Studio interrupted; a bounded local restart is scheduled.');
    restart = setTimeout(start, delay);
  });
}
function stop() {
  if (stopping) return;
  stopping = true;
  if (restart) clearTimeout(restart);
  child?.kill('SIGTERM');
  // Main drains current HTTP and job work. A forced termination still resumes from checkpoints.
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
start();
