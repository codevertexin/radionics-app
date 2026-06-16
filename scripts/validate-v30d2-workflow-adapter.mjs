/**
 * V3.0D.2 — Workflow adapter validation launcher
 * Run: node scripts/validate-v30d2-workflow-adapter.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runner = path.join(root, 'src/lib/workflow-adapter/validateV30d2.ts');

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
  console.log('\n[validate-v30d2] Retrying with npx --yes tsx ...\n');
  result = runWith('npx', ['--yes', 'tsx', '--tsconfig', 'tsconfig.app.json', runner]);
}

if (result.status !== 0) {
  console.error(
    '\n[validate-v30d2] FAILED — install tsx or run: npx tsx src/lib/workflow-adapter/validateV30d2.ts',
  );
  process.exit(result.status ?? 1);
}

process.exit(0);
