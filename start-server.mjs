import { spawn } from 'child_process';
import { openSync } from 'fs';

const logFd = openSync('/home/z/my-project/dev.log', 'w');

const child = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000', '-H', '0.0.0.0', '--webpack'], {
  cwd: '/home/z/my-project',
  env: { ...process.env, PATH: `${process.env.HOME}/.local/node/v25.9.0/bin:${process.env.PATH}` },
  stdio: ['ignore', logFd, logFd],
  detached: true
});

child.unref();
console.log('Server PID:', child.pid);
process.exit(0);
