const fs = require('fs');
const rosaenlgPug = require('rosaenlg');

function nonreg(cb) {
  const phones = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
  fs.open('test/phonesNonreg.json', 'w', (err, fd) => {
    fs.appendFileSync(fd, '[');
    for (let i = 0; i < phones.length; i++) {
      let allParams = {
        phone: phones[i],
        cache: true,
        language: 'en_US',
      };
      rendered = rosaenlgPug.renderFile('templates/phoneForJson.pug', allParams);
      fs.appendFileSync(
        fd,
        JSON.stringify({
          rendered: rendered,
          seed: allParams.util.randomSeed,
        }) + (i != phones.length - 1 ? ',' : ''),
      );
    }
    fs.appendFileSync(fd, ']');
  });
  cb();
}

exports.all = nonreg;
