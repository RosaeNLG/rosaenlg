import { SyncRequestClient } from 'ts-sync-request';
import * as fs from 'fs';

function generateTransitiveList(outputFile: string): void {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  var outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

  let verbs: string[] = [];

  const initialUrl =
    'https://fr.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Cat%C3%A9gorie:Verbes_transitifs_en_fran%C3%A7ais';
  var cmcontinue = '';
  var url = '';

  var step = 1;
  var stop = false;

  do {
    console.log(`${step}`);

    if (cmcontinue == '') {
      url = initialUrl;
    } else {
      url = initialUrl + `&cmcontinue=${cmcontinue}`;
    }
    let response = new SyncRequestClient().get(url);

    if (response == null) {
      stop = true;
    } else {
      if (response['query'] == null) {
        stop = true;
      } else {
        if (response['query']['categorymembers'] == null) {
          stop = true;
        } else {
          const members = response['query']['categorymembers'];
          for (var i = 0; i < members.length; i++) {
            const verb = members[i]['title'];
            if (verb != null) {
              verbs.push(verb);
            }
          }
          if (response['continue'] == null) {
            stop = true;
          } else {
            if (response['continue']['cmcontinue'] == null) {
              stop = true;
            } else {
              cmcontinue = response['continue']['cmcontinue'];
              step++;
            }
          }
        }
      }
    }
  } while (!stop);

  outputStream.write(JSON.stringify(verbs));
  console.log(`done, produced: ${outputFile}`);
}

generateTransitiveList('resources_src/transitive/transitive.json');
