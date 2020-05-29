const fs = require('fs');
const path = require('path');
const rosaenlg = require('rosaenlg');
const packager = require('rosaenlg-packager');

// from https://gist.github.com/kethinov/6658166
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

function migrate() {
  const filelist = walkSync('mirror');
  for (let i = 0; i < filelist.length; i++) {
    const filename = filelist[i];
    console.log(`start migrating ${filename}...`);
    const raw = fs.readFileSync(filename, 'utf8');
    const parsed = JSON.parse(raw);

    // delete existing comp
    delete parsed.comp;

    // force next comp
    parsed.src.compileInfo.activate = true;

    // comp
    packager.completePackagedTemplateJson(parsed, rosaenlg);
    // console.log(parsed);

    // write
    fs.writeFileSync(filename, JSON.stringify(parsed), 'utf8');
  }
}

migrate();
