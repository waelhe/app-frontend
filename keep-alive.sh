#!/bin/bash
export PATH="$HOME/.local/node/v25.9.0/bin:$PATH"
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js dev server..." >> /home/z/my-project/server-pid.log
  node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 --webpack >> /home/z/my-project/next-output.log 2>&1 &
  PID=$!
  echo "[$(date)] PID=$PID" >> /home/z/my-project/server-pid.log
  wait $PID
  echo "[$(date)] Process exited with code $?, restarting in 3s..." >> /home/z/my-project/server-pid.log
  sleep 3
done
