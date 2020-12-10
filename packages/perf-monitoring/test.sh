#!/bin/sh

# on Linux there are problematic \n here
BRANCH="$(git branch --show-current | sed 's/\n//')"

echo "branch: --${BRANCH}--"

pwd

echo existing files:
ls -l benchmark-*.json

# if master, will override previous once done
npx bipbip --compare benchmark-master.json --save benchmark-${BRANCH}.json

echo existing files, after:
ls benchmark-*.json
ls -l benchmark-*.json
