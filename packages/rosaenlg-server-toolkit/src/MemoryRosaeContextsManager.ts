import { RosaeContextsManager, RosaeContextsManagerParams, UserAndTemplateId } from './RosaeContextsManager';
import { RosaeNlgFeatures } from 'rosaenlg-packager';

export class MemoryRosaeContextsManager extends RosaeContextsManager {
  constructor(rosaeNlgFeatures: RosaeNlgFeatures, rosaeContextsManagerParams: RosaeContextsManagerParams) {
    super(rosaeContextsManagerParams);
    this.rosaeNlgFeatures = rosaeNlgFeatures;
    console.info({
      action: 'configure',
      message: `templates only in memory`,
    });
  }

  public hasBackend(): boolean {
    return false;
  }

  public checkHealth(cb: (err: Error) => void): void {
    // always healthy
    cb(null);
  }

  public getFilename(_user: string, _templateId: string): string {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'getFilename must not be called on MemoryRosaeContextsManager';
    throw err;
  }

  protected getAllFiles(cb: (err: Error, files: string[]) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'getAllFiles must not be called on MemoryRosaeContextsManager';
    cb(err, null);
    return;
  }

  public readTemplateOnBackend(user: string, templateId: string, cb: (err: Error, readContent: any) => void): void {
    // find whatever we can in the cache
    if (this.enableCache && this.isInCache(user, templateId)) {
      const foundInCache = this.getFromCache(user, templateId);
      cb(null, foundInCache.rosaeContext.getFullTemplate());
      return;
    }
    const err = new Error();
    err.name = '404';
    err.message = 'not found in cache';
    cb(err, null);
    return;
  }

  protected getUserAndTemplateId(_filename: string): UserAndTemplateId {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'getUserAndTemplateId must not be called on MemoryRosaeContextsManager';
    throw err;
  }

  public saveOnBackend(_filename: string, _content: string, cb: (err: Error) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'saveOnBackend must not be called on MemoryRosaeContextsManager';
    cb(err);
    return;
  }

  public deleteFromBackend(filename: string, cb: (err: Error) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'deleteFromBackend must not be called on MemoryRosaeContextsManager';
    cb(err);
    return;
  }
}
