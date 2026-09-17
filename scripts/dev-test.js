const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ path: '.env.test', override: true });

const envPath = path.resolve('.env');
const envBakPath = path.resolve('.env.bak');
let renamed = false;

if (fs.existsSync(envPath)) {
  fs.renameSync(envPath, envBakPath);
  renamed = true;
  console.log('[dev-test] .env renombrado a .env.bak temporalmente');
}

const next = spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: true });

function restaurar() {
  if (renamed && fs.existsSync(envBakPath)) {
    fs.renameSync(envBakPath, envPath);
    console.log('[dev-test] .env restaurado');
  }
}

next.on('exit', (code) => {
  restaurar();
  process.exit(code);
});

process.on('SIGINT', () => {
  restaurar();
  process.exit(0);
});

process.on('SIGTERM', () => {
  restaurar();
  process.exit(0);
});