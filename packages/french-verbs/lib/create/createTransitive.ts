import { SyncRequestClient } from 'ts-sync-request';
import * as fs from 'fs';

function generateTransitiveList(outputFile: string): void {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  const outputStream = fs.createWriteStream(outputFile);

  const verbs: string[] = [];

  const initialUrl =
    'https://fr.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Cat%C3%A9gorie:Verbes_transitifs_en_fran%C3%A7ais';
  let cmcontinue = '';
  let url = '';

  let step = 1;
  let stop = false;

  do {
    console.log(`${step}`);

    if (cmcontinue === '') {
      url = initialUrl;
    } else {
      url = initialUrl + `&cmcontinue=${cmcontinue}`;
    }
    const response = new SyncRequestClient().get(url);

    if (!response) {
      stop = true;
    } else {
      if (!response['query']) {
        stop = true;
      } else {
        if (!response['query']['categorymembers']) {
          stop = true;
        } else {
          const members = response['query']['categorymembers'];
          for (let i = 0; i < members.length; i++) {
            const verb = members[i]['title'];
            if (verb) {
              verbs.push(verb);
            }
          }
          if (!response['continue']) {
            stop = true;
          } else {
            if (!response['continue']['cmcontinue']) {
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
