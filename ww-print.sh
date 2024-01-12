#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: ww-print.sh [today|week|week-langs]"
    exit 1
fi
if [ "$1" != "today" ] && [ "$1" != "week" ] && [ "$1" != "week-langs" ]; then
    echo "Usage: ww-print.sh [today|week|week-langs]"
    exit 1
fi

DIRNAME=$(dirname "$0")
cd $DIRNAME
node index.js "$1"
