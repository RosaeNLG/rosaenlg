/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const Generator = require('yeoman-generator');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packager = require('rosaenlg-packager');

const logo = `................................................................................
................................................................................
................................................................................
.......................................,........................................
..................................,,,..,..,,....................................
...................................,,,,,,,,.....................................
...............................,,,,,,,,,,,,,,,,,................................
............................,,,,,,,,,,,,,,,,,,,,,,,.............................
.........................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..........................
........................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.........................
......................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.......................
.....................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,......................
....................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.....................
...................,,,,,+IIIIII?,,,,,,,,,,,,,,,=IIIIII?:,,,,....................
..................:,:=IIIIIIIIIIII+,,,,,,,,,~IIIIIIIIIIII?,,,...................
..................,,IIIIIIIIIIIIIIII,,,,,,,IIIIIIIIIIIIIIII,,...................
.................,,IIIIIIIIIIIIIIIIII,,,,,IIIIIIIIIIIIIIIIII:,..................
.................,IIIIIIIIIIIIIIIIIIII,,:IIIIIIIIIIIIIIIIIIII:..................
.................IIIIIIIIIIIIIIIIIIIIII,IIIIIIIIIIIIIIIIIIIIII..................
................,IIIIIIIIII+.77IIIIIIII:IIIIIII,...,IIIIIIIIII,.................
................=IIIIIIIIII...,.IIIIIII.IIIIIII..,  IIIIIIIIIII.................
................=IIIIIIIIII.....IIIIII...IIIIII.....IIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIIIII.....IIIIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIIII.......IIIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIII.........IIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIII..?.....I..IIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIII?.............,IIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIII.IIIIIIIIIIIIIII.IIIIIIIIIIIIIII.................
................=IIIIIIIIIIIII.IIIIIIIIIIIIIII+I,IIIIIIIIIIIIII.................
................=IIIIIIIIIIII~IIIIIIIIIIIIIIIIIII7IIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIII.III.III.IIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIIIIII..,IIIIIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIII=IIIIII?..,IIIIIIIIIIIIIIIIIIIIII.................
................=IIIIIIIIIIIIIIIIIIII,..,:IIIIIIIIIIIIIIIIIIIII.................
................=IIIIIIII,IIIIIIIIII,,..,:,=IIIIIIIII=IIIIIIIII.................
................=IIIIIIII.IIIIIIII,,,,..,:,,,IIIIIIII,IIIIIIIII.................
................=IIIIIIII....+:,,,,,,,..,:,,,,,,,+...,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................=IIIIIIII....,,,,,,,,,..,:,,,,,,,....,IIIIIIIII.................
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................`;

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname,
      },
    ]);
  }

  async writing() {
    this.copyfiles();
    this.unpack();
  }

  copyfiles() {
    this.log('copy standard files...');

    // package.json
    const packageJson = JSON.parse(fs.readFileSync(this.templatePath('package.json'), 'utf-8'));
    packageJson.name = this.answers.name;
    delete packageJson.version;
    delete packageJson.description;
    delete packageJson.repository;
    delete packageJson.author;
    delete packageJson.license;
    delete packageJson.bugs;
    delete packageJson.homepage;
    this.fs.writeJSON(this.destinationPath('package.json'), packageJson);

    // README.md
    let readme = fs.readFileSync(this.templatePath('README.md'), 'utf-8');
    readme = readme.replace('RosaeNLG boilerplate', this.answers.name);
    this.fs.write(this.destinationPath('README.md'), readme);

    // folders
    const folders = ['data', 'gulpfile.js', 'test'];
    if (!this.options.unpack) {
      folders.push('templates');
    }
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      this.fs.copy(this.templatePath(folder), this.destinationPath(folder));
    }
  }

  unpack() {
    if (this.options.unpack) {
      this.log('unpacking', this.options.unpack, '...');

      try {
        const rawPackage = fs.readFileSync(this.options.unpack, 'utf-8');
        this.log('file read is ok...');

        try {
          const parsed = JSON.parse(rawPackage);
          this.log('file parsing is ok...');

          try {
            const tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'rosaenlg-'));
            this.log('temp folder is', tmpFolder);
            packager.expandPackagedTemplateJson(parsed, tmpFolder);
            this.fs.copy(tmpFolder, this.destinationPath('templates'));

            this.log('templates extraction is ok...');
          } catch (extractErr) {
            // istanbul ignore next
            this.log('cannot extract JSON:', this.options.unpack, extractErr);
            // istanbul ignore next
            throw extractErr;
          }
        } catch (syntaxError) {
          this.log('JSON is invalid:', this.options.unpack, syntaxError);
          throw syntaxError;
        }
      } catch (readFileErr) {
        this.log('cannot read file:', this.options.unpack, readFileErr);
        throw readFileErr;
      }
    }
  }

  install() {
    this.npmInstall();
  }

  end() {
    this.log('done! check doc on https://rosaenlg.org');
  }

  initializing() {
    this.argument('unpack', {
      type: String,
      desc: 'path to existing templates in a packaged json file',
      required: false,
    });

    this.sourceRoot(__dirname + '../../../node_modules/rosaenlg-boilerplate');
    this.log('getting templates from', this.sourceRoot());

    this.log(logo);
    this.log('');
    this.log('~~~ RosaeNLG bootstrap generator ~~~');
  }

  constructor(args, opts) {
    super(args, opts);
  }
};
