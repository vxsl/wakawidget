#!/bin/bash
DIRNAME=$(dirname "$0")
cd $DIRNAME
npm install
node index.js
