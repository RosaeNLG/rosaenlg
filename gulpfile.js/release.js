const fs = require('fs');
const semver = require('semver');
// const { execSync } = require('child_process');

const changelogPath = 'packages/rosaenlg-doc/doc/modules/ROOT/pages/changelog.adoc';
const antoraPath = 'packages/rosaenlg-doc/doc/antora.yml';
const githubPathVersion = 'workflows/version.yml';

function getChangelogLast() {
  const content = fs.readFileSync(changelogPath, 'utf-8');
  const versionRe = RegExp('== \\[([0-9]+\\.[[0-9]+\\.[[0-9]+)\\]');
  const currentVersion = versionRe.exec(content)[1];
  if (!currentVersion) {
    console.log('could not find current version');
    process.exit(1);
  }
  if (!semver.valid(currentVersion)) {
    console.log('current version is invalid:', currentVersion);
    process.exit(1);
  }
  return currentVersion;
}

function getDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
}

function updateChangelog(newVersion) {
  let content = fs.readFileSync(changelogPath, 'utf-8');
  // only second occurrence
  let t = 0;
  content = content.replace(/\[Unreleased\]/g, function (match) {
    t++;
    return t === 2 ? `[${newVersion}] - ${getDate()}` : match;
  });
  fs.writeFileSync(changelogPath, content, 'utf-8');
}

function updateAntora(newVersion) {
  let content = fs.readFileSync(antoraPath, 'utf-8');
  content = content.replace(/version: '.*'/, `version: '${newVersion}'`);
  fs.writeFileSync(antoraPath, content, 'utf-8');
}

function updateGithub(file, newVersion) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/ROSAENLG_VERSION: [0-9\.]+/, `ROSAENLG_VERSION: ${newVersion}`);
  fs.writeFileSync(file, content, 'utf-8');
}

function release(change, cb) {
  // const change = getChange();
  console.log('change requested:', change);

  currentVersion = getChangelogLast();
  console.log('current version:', currentVersion);

  const newVersion = semver.inc(currentVersion, change);
  console.log('new version:', newVersion);

  updateChangelog(newVersion);
  updateAntora(newVersion);
  updateGithub(githubPathVersion, newVersion);

  cb();
}

function releasePatch(cb) {
  release('patch', cb);
}
function releaseMinor(cb) {
  release('minor', cb);
}
function releaseMajor(cb) {
  release('major', cb);
}

exports.patch = releasePatch;
exports.minor = releaseMinor;
exports.major = releaseMajor;
