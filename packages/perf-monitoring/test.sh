#!/bin/sh

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo branch: $BRANCH

# if master, will override previous once done
npx bipbip --compare benchmark-master.json --save benchmark-${BRANCH}.json
