#!/bin/sh
npm install --prefer-offline --no-audit --no-fund 2>/dev/null
exec node_modules/.bin/tsx server.ts
