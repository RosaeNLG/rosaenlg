/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CacheValue,
  RosaeContextsManager,
  RosaeContextsManagerParams,
  UserAndTemplateId,
} from './RosaeContextsManager';
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

  public checkHealth(cb: (err: Error | undefined) => void): void {
    // always healthy
    cb(undefined);
  }

  protected getAllFiles(cb: (err: Error | undefined, files: string[] | undefined) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'getAllFiles must not be called on MemoryRosaeContextsManager';
    cb(err, undefined);
  }

  public readTemplateOnBackend(
    user: string,
    templateId: string,
    cb: (err: Error | undefined, readContent: any) => void,
  ): void {
    // find whatever we can in the cache
    if (this.enableCache && this.isInCache(user, templateId)) {
      const foundInCache = this.getFromCache(user, templateId);
      cb(undefined, (foundInCache as CacheValue).rosaeContext.getFullTemplate());
      return;
    }
    const err = new Error();
    err.name = '404';
    err.message = 'not found in cache';
    cb(err, null);
  }

  protected getUserAndTemplateId(_filename: string): UserAndTemplateId {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'getUserAndTemplateId must not be called on MemoryRosaeContextsManager';
    throw err;
  }

  public saveOnBackend(_user: string, _templateId: string, _content: string, cb: (err: Error) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'saveOnBackend must not be called on MemoryRosaeContextsManager';
    cb(err);
  }

  public deleteFromBackend(_user: string, _templateId: string, cb: (err: Error) => void): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'deleteFromBackend must not be called on MemoryRosaeContextsManager';
    cb(err);
  }
}
