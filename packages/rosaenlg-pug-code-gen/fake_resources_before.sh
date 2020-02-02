# rename

# fr
mv ../french-words-gender-lefff/dist/words.json ../french-words-gender-lefff/dist/words.json.BU
mv ../french-verbs-lefff/dist/conjugations.json ../french-verbs-lefff/dist/conjugations.json.BU

# de
mv ../german-words-dict/dist/words.json ../german-words-dict/dist/words.json.BU
mv ../german-adjectives-dict/dist/adjectives.json ../german-adjectives-dict/dist/adjectives.json.BU
mv ../german-verbs-dict/dist/verbs.json ../german-verbs-dict/dist/verbs.json.BU

# it
mv ../italian-words-dict/dist/words.json ../italian-words-dict/dist/words.json.BU
mv ../italian-adjectives-dict/dist/adjectives.json ../italian-adjectives-dict/dist/adjectives.json.BU
mv ../italian-verbs-dict/dist/verbs.json ../italian-verbs-dict/dist/verbs.json.BU

# fake ones
echo {} > ../french-words-gender-lefff/dist/words.json
echo {} > ../french-verbs-lefff/dist/conjugations.json
echo {} > ../german-words-dict/dist/words.json
echo {} > ../german-adjectives-dict/dist/adjectives.json
echo {} > ../german-verbs-dict/dist/verbs.json
echo {} > ../italian-words-dict/dist/words.json
echo {} > ../italian-adjectives-dict/dist/adjectives.json
echo {} > ../italian-verbs-dict/dist/verbs.json
