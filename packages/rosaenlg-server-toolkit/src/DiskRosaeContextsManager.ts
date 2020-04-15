import * as fs from 'fs';
import { RosaeContextsManager, RosaeContextsManagerParams, UserAndTemplateId } from './RosaeContextsManager';
import { PackagedTemplateWithUser, RosaeNlgFeatures } from 'rosaenlg-packager';

export class DiskRosaeContextsManager extends RosaeContextsManager {
  private templatesPath: string;

  constructor(
    templatesPath: string,
    rosaeNlgFeatures: RosaeNlgFeatures,
    rosaeContextsManagerParams: RosaeContextsManagerParams,
  ) {
    super(rosaeContextsManagerParams);
    this.templatesPath = templatesPath;
    this.rosaeNlgFeatures = rosaeNlgFeatures;
    console.info({
      action: 'configure',
      message: `templates path is ${this.templatesPath}`,
    });
  }

  public hasBackend(): boolean {
    return true;
  }

  public checkHealth(cb: (err: Error) => void): void {
    const filename = `${this.templatesPath}/health_${this.getKindOfUuid()}.tmp`;
    const content = 'health check';
    fs.writeFile(filename, content, 'utf8', (err) => {
      if (err) {
        cb(err);
        return;
      } else {
        fs.unlink(filename, () => {
          cb(null);
          return;
        });
      }
    });
  }

  public getFilename(user: string, templateId: string): string {
    return user + '#' + templateId + '.json';
  }

  protected getAllFiles(cb: (err: Error, files: string[]) => void): void {
    fs.readdir(this.templatesPath, (err, files) => {
      if (err) {
        console.error({
          message: `cannot read disk: ${err}`,
        });
        cb(err, null);
      } else {
        cb(null, files);
      }
    });
  }

  public readTemplateOnBackend(
    user: string,
    templateId: string,
    cb: (err: Error, templateContent: PackagedTemplateWithUser) => void,
  ): void {
    const entryKey = this.getFilename(user, templateId);

    fs.readFile(`${this.templatesPath}/${entryKey}`, 'utf8', (readFileErr, rawTemplateContent) => {
      if (readFileErr) {
        // does not exist: we don't care, don't even log
        const e = new Error();
        e.name = '404';
        e.message = `${entryKey} not found on disk: ${readFileErr.message}`;
        cb(e, null);
        return;
      } else {
        let parsed: PackagedTemplateWithUser;
        try {
          parsed = JSON.parse(rawTemplateContent);
        } catch (parseErr) {
          const e = new Error();
          e.name = '500';
          e.message = `could not parse: ${parseErr}`;
          cb(e, null);
          return;
        }
        cb(null, parsed);
        return;
      }
    });
  }

  protected getUserAndTemplateId(filename: string): UserAndTemplateId {
    return this.getUserAndTemplateIdHelper(filename, '#');
  }

  protected saveOnBackend(filename: string, content: string, cb: (err: Error) => void): void {
    fs.writeFile(`${this.templatesPath}/${filename}`, content, 'utf8', (err) => {
      cb(err);
    });
  }

  public deleteFromBackend(filename: string, cb: (err: Error) => void): void {
    // delete the file
    const fileToDelete = `${this.templatesPath}/${filename}`;
    fs.unlink(fileToDelete, (err) => {
      cb(err);
    });
  }
}
