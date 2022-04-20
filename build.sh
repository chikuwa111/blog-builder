#!/usr/bin/bash

cd `dirname $0`
npm run build && npx foam-cli janitor -w $(npm run --silent get-dest-path)
