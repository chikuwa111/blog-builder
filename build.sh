#!/usr/bin/bash

cd `dirname $0`
npm run build && npm run update-wikilink -- $(npm run --silent get-dest-path)
