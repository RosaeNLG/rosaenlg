'use strict'

const vfs = require('vinyl-fs')
let replace = require('gulp-replace')
let rename = require('gulp-rename')

let rosaenlgVersion = require('rosaenlg/package.json').version

const { parallel } = require('gulp')

const editorGlue = (src, dest, preview) => () => {
  return vfs.src([
    `../rosaenlg/dist/rollup/*${rosaenlgVersion}*.js`,
    `node_modules/codemirror-minified/lib/codemirror.js`,
    `node_modules/codemirror-minified/mode/pug/pug.js`,
    `node_modules/codemirror-minified/mode/javascript/javascript.js`,
    `node_modules/vue-codemirror/dist/vue-codemirror.js`,
    `src/js/editor/vue.min.js`,
  ]).pipe(vfs.dest(dest + '/js/vendor'))
}

const editorOther = (src, dest, preview) => () => {
  return vfs.src([
    `src/js/editor/editor.js`,
  ]).pipe(replace('ROSAE_NLG_VERSION', rosaenlgVersion))
    .pipe(rename(`editor-${rosaenlgVersion}.js`))
    .pipe(vfs.dest(dest + '/js/vendor'))
}

module.exports = (src, dest, preview) => parallel(editorGlue(src, dest, preview), editorOther(src, dest, preview))
