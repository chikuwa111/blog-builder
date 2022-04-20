#!/usr/bin/bash

cd `dirname $0`
npm run build && npx foam-cli janitor $(npm run --silent get-dest-path)
