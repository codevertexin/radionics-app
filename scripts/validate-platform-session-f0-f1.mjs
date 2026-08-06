/**
 * Platform Session F0+F1 validation launcher
 * Run: node scripts/validate-platform-session-f0-f1.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runner = path.join(root, 'src/platform/session/validatePlatformSessionF0F1.ts');

function runWith(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, VITE_DATA_MODE: 'mock' },
  });
}

let result = runWith('npx', ['tsx', '--tsconfig', 'tsconfig.app.json', runner]);

if (result.status !== 0) {
  console.log('\n[validate-platform-session-f0-f1] Retrying with npx --yes tsx ...\n');
  result = runWith('npx', ['--yes', 'tsx', '--tsconfig', 'tsconfig.app.json', runner]);
}

if (result.status !== 0) {
  console.error(
    '\n[validate-platform-session-f0-f1] FAILED — install tsx or run:\n  npx tsx --tsconfig tsconfig.app.json src/platform/session/validatePlatformSessionF0F1.ts',
  );
  process.exit(result.status ?? 1);
}

process.exit(0);
