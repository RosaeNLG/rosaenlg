#!/bin/sh

# https://stackoverflow.com/questions/2829613/how-do-you-tell-if-a-string-contains-another-string-in-posix-sh
# contains(string, substring)
#
# Returns 0 if the specified string contains the specified substring,
# otherwise returns 1.
contains() {
    string="$1"
    substring="$2"
    if test "${string#*$substring}" != "$string"
    then
        return 0    # $substring is in $string
    else
        return 1    # $substring is not in $string
    fi
}


# create a template

curl -X PUT \
  http://docker:5000/templates \
  -H 'Accept: */*' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -o creation.json \
  -d '{
  "templateId": "chanson",
  "entryTemplate": "chanson.pug",
  "compileInfo": {
    "activate": false,
    "compileDebug": false,
    "language": "fr_FR"
  },
  "templates": {
    "chanson.pug": "p\n  | il #[+verb(getAnonMS(), {verb: '\''chanter'\'', tense:'\''FUTUR'\''} )]\n  | \"#{chanson.nom}\"\n  | de #{chanson.auteur}\n"
  }
}
'

CAT_CREATION="$(cat creation.json)"
echo "TEST CREATION ON: $CAT_CREATION"
contains "$CAT_CREATION" "templateSha1" || exit 1
echo "TEST CREATION: OK!"

# ok this is ugly
TEMPLATE_SHA1="$(cat creation.json | grep -Eo '"templateSha1":.*?[^\\]",' | awk -F':\"' '{print $2}' | awk -F'\"' '{print $1}')"
echo "SHA1: $TEMPLATE_SHA1"

# render the template

curl -X POST \
  http://docker:5000/templates/chanson/$TEMPLATE_SHA1/render \
  -H 'Accept: */*' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -o render.json \
  -d '{
  "language": "fr_FR",
  "chanson": {
    "auteur": "Édith Piaf",
    "nom": "Non, je ne regrette rien"
  }
}'


CAT_RENDER="$(cat render.json)"
echo "TEST RENDER ON: $CAT_RENDER"
contains "$CAT_RENDER" "Il chantera" || exit 1
echo "TEST RENDER: OK!"

exit 0
