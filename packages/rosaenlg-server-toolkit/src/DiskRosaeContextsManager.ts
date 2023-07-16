/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { RosaeContextsManager, RosaeContextsManagerParams, UserAndTemplateId } from './RosaeContextsManager';
import { RosaeNlgFeatures } from 'rosaenlg-packager';

export class DiskRosaeContextsManager extends RosaeContextsManager {
  private templatesPath: string;
  private sharedTemplatesPath: string | undefined;

  constructor(
    templatesPath: string,
    rosaeNlgFeatures: RosaeNlgFeatures,
    rosaeContextsManagerParams: RosaeContextsManagerParams,
  ) {
    super(rosaeContextsManagerParams);
    this.templatesPath = templatesPath;
    if (rosaeContextsManagerParams && rosaeContextsManagerParams.sharedTemplatesPath) {
      this.sharedTemplatesPath = rosaeContextsManagerParams.sharedTemplatesPath;
    }
    this.rosaeNlgFeatures = rosaeNlgFeatures;
    console.info({
      action: 'configure',
      message: `templates path is ${this.templatesPath}`,
    });
  }

  public hasBackend(): boolean {
    return true;
  }

  public checkHealth(cb: (err: Error | undefined) => void): void {
    const filename = `${this.templatesPath}/health_${this.getKindOfUuid()}.tmp`;
    const content = 'health check';
    fs.writeFile(filename, content, 'utf8', (err) => {
      if (err) {
        cb(err);
      } else {
        fs.unlink(filename, () => {
          cb(undefined);
        });
      }
    });
  }

  public getPathAndFilename(user: string, templateId: string): string {
    let path: string;
    if (this.sharedTemplatesPath && this.sharedTemplatesUser && this.sharedTemplatesUser == user) {
      path = this.sharedTemplatesPath;
    } else {
      path = this.templatesPath;
    }
    return path + '/' + user + '#' + templateId + '.json';
  }

  protected getAllFiles(cb: (err: Error | undefined, files: string[] | undefined) => void): void {
    fs.readdir(this.templatesPath, (err, files) => {
      if (err) {
        console.error({
          message: `cannot read disk: ${err}`,
        });
        cb(err, undefined);
      } else {
        cb(undefined, files);
      }
    });
  }

  public readTemplateOnBackend(
    user: string,
    templateId: string,
    cb: (err: Error | undefined, readContent: any) => void,
  ): void {
    fs.readFile(this.getPathAndFilename(user, templateId), 'utf8', (readFileErr, rawTemplateContent) => {
      if (readFileErr) {
        // does not exist: we don't care, don't even log
        const e = new Error();
        e.name = '404';
        e.message = `${this.getPathAndFilename(user, templateId)} not found on disk: ${readFileErr.message}`;
        cb(e, null);
      } else {
        let parsed: any;
        try {
          parsed = JSON.parse(rawTemplateContent);
        } catch (parseErr) {
          const e = new Error();
          e.name = '400';
          e.message = `could not parse: ${parseErr}`;
          cb(e, undefined);
          return;
        }
        cb(undefined, parsed);
      }
    });
  }

  protected getUserAndTemplateId(filename: string): UserAndTemplateId | undefined {
    return this.getUserAndTemplateIdHelper(filename, '#');
  }

  public saveOnBackend(user: string, templateId: string, content: string, cb: (err: Error | undefined) => void): void {
    fs.writeFile(this.getPathAndFilename(user, templateId), content, 'utf8', (err) => {
      cb(err as Error);
    });
  }

  public deleteFromBackend(user: string, templateId: string, cb: (err: Error | undefined) => void): void {
    // delete the file
    fs.unlink(this.getPathAndFilename(user, templateId), (err) => {
      cb(err as Error);
    });
  }
}
