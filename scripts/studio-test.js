const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.resolve('.env');
const bakPath = path.resolve('.env.bak');

let renamed = false;
if (fs.existsSync(envPath)) {
  fs.renameSync(envPath, bakPath);
  renamed = true;
}

require('dotenv').config({ path: '.env.test', override: true });

const result = spawnSync('npx', ['prisma', 'studio'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

if (renamed) {
  fs.renameSync(bakPath, envPath);
}

process.exit(result.status ?? 1);