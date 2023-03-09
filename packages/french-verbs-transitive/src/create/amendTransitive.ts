/**
 * @license
 * Copyright 2023 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { FrenchVerbsTransitive } from '../index';

export function amendTransitiveList(fileToAmend: string, cb: () => void): void {
  const originalFileContent = fs.readFileSync(fileToAmend, { encoding: 'utf8', flag: 'r' });
  const verbs: FrenchVerbsTransitive = JSON.parse(originalFileContent);

  const toAddList = ['manger'];

  let addedCount = 0;
  for (const verbToAdd of toAddList) {
    if (verbs.indexOf(verbToAdd) === -1) {
      verbs.push(verbToAdd);
      addedCount++;
    }
  }

  if (fs.existsSync(fileToAmend)) {
    fs.unlinkSync(fileToAmend);
  }
  fs.writeFileSync(fileToAmend, JSON.stringify(verbs), { encoding: 'utf8' });

  console.log(`done for amend, amended: ${fileToAmend} with ${addedCount} verbs`);
  cb();
}
