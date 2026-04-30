#!/bin/bash
export PATH="$HOME/.local/node/v25.9.0/bin:$PATH"
cd /home/z/my-project
trap 'echo "RECEIVED SIGNAL - SHUTTING DOWN" >> /home/z/my-project/next-crash.log' EXIT SIGTERM SIGINT SIGKILL
echo "Starting at $(date)" >> /home/z/my-project/next-crash.log
node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 --webpack 2>>/home/z/my-project/next-crash.log >> /home/z/my-project/next-crash.log
echo "EXIT CODE: $? at $(date)" >> /home/z/my-project/next-crash.log
