# delete fake ones

rm ../french-words-gender-lefff/dist/words.json
rm ../french-verbs-lefff/dist/conjugations.json
rm ../german-words-dict/dist/words.json
rm ../german-adjectives-dict/dist/adjectives.json
rm ../german-verbs-dict/dist/verbs.json
rm ../italian-words-dict/dist/words.json
rm ../italian-adjectives-dict/dist/adjectives.json
rm ../italian-verbs-dict/dist/verbs.json


# take from backup

# fr
mv ../french-words-gender-lefff/dist/words.json.BU ../french-words-gender-lefff/dist/words.json
mv ../french-verbs-lefff/dist/conjugations.json.BU ../french-verbs-lefff/dist/conjugations.json

# de
mv ../german-words-dict/dist/words.json.BU ../german-words-dict/dist/words.json
mv ../german-adjectives-dict/dist/adjectives.json.BU ../german-adjectives-dict/dist/adjectives.json
mv ../german-verbs-dict/dist/verbs.json.BU ../german-verbs-dict/dist/verbs.json

# it
mv ../italian-words-dict/dist/words.json.BU ../italian-words-dict/dist/words.json
mv ../italian-adjectives-dict/dist/adjectives.json.BU ../italian-adjectives-dict/dist/adjectives.json
mv ../italian-verbs-dict/dist/verbs.json.BU ../italian-verbs-dict/dist/verbs.json
