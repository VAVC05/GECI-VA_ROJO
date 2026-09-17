const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.resolve('.env');
const bakPath = path.resolve('.env.bak');

let renamed = false;
if (fs.existsSync(envPath)) {
  fs.renameSync(envPath, bakPath);
  renamed = true;
  console.log('[seed-test] .env oculto temporalmente');
}

require('dotenv').config({ path: '.env.test', override: true });

console.log('[seed-test] DATABASE_URL:', (process.env.DATABASE_URL || '').replace(/:([^:@]+)@/, ':***@'));

const result = spawnSync('npx', ['prisma', 'db', 'seed'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

if (renamed) {
  fs.renameSync(bakPath, envPath);
  console.log('[seed-test] .env restaurado');
}

process.exit(result.status ?? 1);