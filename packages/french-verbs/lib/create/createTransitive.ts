
import { SyncRequestClient } from 'ts-sync-request';
import * as fs from "fs"

function generateTransitiveList(outputFile:string):void {
  
  if (fs.existsSync(outputFile)) { fs.unlinkSync(outputFile); }
  var outputStream:fs.WriteStream = fs.createWriteStream(outputFile);

  let verbs:string[] = [];

  const initialUrl:string = 'https://fr.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Cat%C3%A9gorie:Verbes_transitifs_en_fran%C3%A7ais';
  var cmcontinue:string = '';
  var url = '';

  do {
    if (cmcontinue=='') {
      url = initialUrl;
    } else {
      url = initialUrl + `&cmcontinue=${cmcontinue}`;
    }
    let response = new SyncRequestClient().get(url);
    
    cmcontinue = response['continue']['cmcontinue'];
    console.log(cmcontinue);

    const members = response['query']['categorymembers'];
    for (var i=0; i<members.length; i++ ) {
      const verb = members[i]['title'];
      verbs.push(verb);
    }
  } while (cmcontinue!=null && cmcontinue!='');

  outputStream.write(JSON.stringify(verbs));
  console.log(`done, produced: ${outputFile}`);

}

generateTransitiveList('resources_src/transitive/transitive.json');

