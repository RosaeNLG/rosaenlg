#!/bin/sh

# Copyright 2019 Ludan Stoecklé
# SPDX-License-Identifier: MIT

echo "$0"
echo "$1"
echo "$2"

cat fruits.pug | docker run -i $1 -l en_US >> res.txt 2>&1

RES="$(cat res.txt)"
EXPECTED="<p>I love apples, bananas, apricots and pears!</p>"

echo "$RES"

if test "$RES" = "$EXPECTED"; then
  echo "TEST: OK!"
  exit 0
else
  echo "TEST: FAILS! :-("
  exit 1
fi
