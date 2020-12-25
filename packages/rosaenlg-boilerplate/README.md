# RosaeNLG boilerplate

## Start your project

For real time debug and rendering:

- open a terminal in VSCode
- use `npx rosaenlg-cli -l en_US -w templates\phoneCli.pug`


Gulp/CI:

- `gulp init` to create `dist` folder
- `gulp texts` to generate the texts in `dist`
- testing:
  - `mocha` to run the tests
  - use `npm run test` or `gulp test` to run the tests _and_ generate a nice report in `mochawesome-report` folder
  - `gulp nonreg` to generate the non regression reference test file
- optional: use `gulp package` to package your templates for usage in a RosaeNLG server


## Upload an existing project

- put the JSON file containing your packaged template at the root folder, named `packaged.json`
- `gulp unpack` will delete the content of templates folder and unpack your packaged template in it
