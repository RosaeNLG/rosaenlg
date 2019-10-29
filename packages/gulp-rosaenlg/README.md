# gulp-rosaenlg

Helps to compile rosaeNLG templates in js files for client side in browser rendering.
It can be used independantly of gulp. For an example of integration with gulp see `rosaenlg-browser-poc` technical demo project. 

## Installation 
```sh
npm install gulp-freenlpg
```

## Usage

`compileTemplates` will compile and package one or multiple RosaeNLG templates for browser side rendering in a stream and returns that stream:

* `sourcesAndNames` (array, mandatory): each entry must have 2 properties, `source` for the filename of the template and `name` for the name of the generated function
* `language` (string, mandatory): any supported rosaeNLG language (all templates must have the same language)
* `dest` (string, mandatory): the destination js filename
* `holderName` (string, mandatory): the name of the package that will hold all the functions
* `tinyify` (boolean, optional): put true if you want to tinyify the output

`renderTemplateInFile` renders a RosaeNLG template into a file:

* `template` (string, mandatory): the filename of the template to render
* `dest` (string, mandatory): the filename that will contain the output
* `options` (mandatory): the parameters that will be given to `renderFile`; typically put `language` and most often some data.

`packageTemplateJson` packages (and optionnaly compiles) templates into a single object, generally for JSON serialization. One single `PackagedTemplateParams` param:

* `templateId`: string; will be just kept as is (not used during the packaging process)
* `entryTemplate`: string; the main template; do not put the full path
* `folderWithTemplates`: string; the folder containing all the templates (including the `entryTemplate`)
* `compileInfo`: mandatory as at some point compilation will occur
    * `activate`: boolean; if set, the template will be compiled, and included in the output
    * `compileDebug`: boolean; activate Pug debug
    * `language`: language
* `autotest`: all fields will just be copied as is in the output (not used during packaging)
    * `activate`: boolean
    * `input`: object that is a valid input to render the template
    * `expected`: string[]; strings that should be in the rendered template


```javascript
var gulpFreenlpg = require('gulp-rosaenlg');
const fs = require('fs');

const tmpFile = 'tmp.js';

let os = gulpFreenlpg.compileTemplates([{source: 'test/test.pug', name:'test'}], 'en_US', tmpFile, 'templates_holder');

os.on('finish', function() {
  console.log('DONE');
  const compiledString = fs.readFileSync(tmpFile, 'utf-8');
  console.log(`done: ${compiledString.length}`);
  // fs.unlinkSync(tmpFile);  
});
```

## Todo

Make `renderTemplateInFile` asynchronous.

## Dependancies

* rosaeNLG
* browserify
