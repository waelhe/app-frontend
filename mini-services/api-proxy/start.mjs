import { spawn } from 'child_process';
import { openSync } from 'fs';

const logFd = openSync('/home/z/my-project/mini-services/api-proxy/proxy.log', 'w');

const child = spawn('node', ['index.mjs'], {
  cwd: '/home/z/my-project/mini-services/api-proxy',
  env: { ...process.env, BACKEND_URL: 'https://app-java-v3-production.up.railway.app' },
  stdio: ['ignore', logFd, logFd],
  detached: true,
});

child.unref();
console.log('Proxy PID:', child.pid);
process.exit(0);
