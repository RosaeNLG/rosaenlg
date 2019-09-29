const fs = require('fs');

function init(cb) {
  const folders = ['../dist', '../dist/browser'];

  folders.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log('📁  folder created:', dir);
    }
  });
  cb();
}

exports.init = init;
