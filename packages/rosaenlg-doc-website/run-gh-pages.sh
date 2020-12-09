#!/bin/sh

NOW=$(date "+%s")
echo "${NOW}"

npx antora --attribute page-date-now=${NOW} playbook-gh-pages.yml
