'use strict'

const connect = require('gulp-connect')

module.exports = (root, opts = {}, watch = undefined) => (done) => {
  connect.server({ ...opts, root }, function () {
    this.server.on('close', done)
    if (watch) watch()
  })
}
