'use strict'

const autoprefixer = require('autoprefixer')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const fs = require('fs-extra')
const merge = require('merge-stream')
const { obj: map } = require('through2')
const ospath = require('path')
const path = ospath.posix
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const postcssVar = require('postcss-custom-properties')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')

module.exports = (src, dest, preview) => () => {
  const opts = { base: src, cwd: src }
  const postcssPlugins = [
    postcssImport(),
    postcssUrl([
      {
        filter: '**/~typeface-*/files/*',
        url: (asset) => {
          const relpath = asset.pathname.substr(1)
          const abspath = ospath.resolve('node_modules', relpath)
          const basename = ospath.basename(abspath)
          const destpath = ospath.join(dest, 'font', basename)
          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
          return path.join('..', 'font', basename)
        },
      },
    ]),
    postcssVar({ preserve: preview ? 'preserve-computed' : false }),
    postcssCalc(),
    autoprefixer({ browsers: ['last 2 versions'] }),
    preview ? () => {} : cssnano({ preset: 'default' }),
  ]

  return merge(
    vfs
      .src('js/+([0-9])-*.js', opts)
      .pipe(uglify())
      .pipe(concat('js/site.js')),
    vfs
      // atm only highlight.js
      .src('js/vendor/*.js', Object.assign({ read: false }, opts))
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, enc, next) => {
          file.contents = browserify(file.relative, { basedir: src, detectGlobals: false }).bundle()
          next(null, file)
        })
      )
      .pipe(buffer())
      // does not work when using standard uglify no more, for some reason, since using highlight.js 10.6.0
      // also check https://gitlab.com/antora/antora-ui-default/-/issues/5
      .pipe(uglify({compress: false})),
    vfs.src('css/site.css', opts).pipe(postcss(postcssPlugins)),
    vfs.src('font/*.woff*(2)', opts),
    vfs.src('img/**/*.{jpg,ico,png,svg}', opts),
    vfs.src('helpers/*.js', opts),
    vfs.src('layouts/*.hbs', opts),
    vfs.src('partials/*.hbs', opts)
  ).pipe(vfs.dest(dest))
}
