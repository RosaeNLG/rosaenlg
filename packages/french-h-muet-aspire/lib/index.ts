
import fs = require('fs');

let hAspireList: string[];
function load() {
  if (hAspireList!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    hAspireList = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/haspire.json', 'utf8'));
  }

}

export function getCompleteList(): string[] {
  load();
  return hAspireList;
}

function isH(word:string): boolean {
  return word.charAt(0)=='h' || word.charAt(0)=='H';
}

export function isHAspire(word: string): boolean {
  if (!isH(word)) { return false; }
  load();
  return hAspireList.indexOf( word.toLowerCase() )!=-1;
}

export function isHMuet(word: string): boolean {
  if (!isH(word)) { return false; }
  load();
  return !isHAspire(word);
}
