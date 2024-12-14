#!/bin/bash
DIRNAME=$(dirname "$0")
cd $DIRNAME
npm install
# node index.js

# try node index.js, and if it fails just fail silently:
node index.js &2>/dev/null
