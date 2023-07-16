/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import NodeCache = require('node-cache');
import { RosaeContext } from './RosaeContext';
import { PackagedTemplate, RosaeNlgFeatures } from 'rosaenlg-packager';
import * as process from 'process';

interface CacheKey {
  user: string;
  templateId: string;
}

export interface CacheValue {
  templateSha1: string;
  rosaeContext: RosaeContext;
}

export interface RosaeContextsManagerParams {
  // origin: string;
  forgetTemplates?: boolean;
  specificTtl?: number;
  specificCheckPeriod?: number;
  enableCache?: boolean;
  sharedTemplatesUser?: string;
  sharedTemplatesPath?: string;
}

export interface UserAndTemplateId {
  user: string;
  templateId: string;
}

export abstract class RosaeContextsManager {
  private ttl: number;
  private cacheCheckPeriod: number;
  private forgetTemplates: boolean | undefined;
  protected enableCache: boolean;
  // protected origin: string;
  protected rosaeNlgFeatures: RosaeNlgFeatures | undefined = undefined;

  private rosaeContextsCache: NodeCache;
  protected sharedTemplatesUser: string | undefined;

  constructor(rosaeContextsManagerParams: RosaeContextsManagerParams) {
    this.ttl = rosaeContextsManagerParams.specificTtl || 600; // 10 minutes
    this.cacheCheckPeriod = rosaeContextsManagerParams.specificCheckPeriod || 60; // 1 minute
    this.forgetTemplates = rosaeContextsManagerParams.forgetTemplates;
    this.enableCache = rosaeContextsManagerParams.enableCache != null ? rosaeContextsManagerParams.enableCache : true; // enabled by default
    // this.origin = rosaeContextsManagerParams.origin;
    this.sharedTemplatesUser = rosaeContextsManagerParams.sharedTemplatesUser;

    this.rosaeContextsCache = new NodeCache({
      checkperiod: this.cacheCheckPeriod,
      useClones: false,
      deleteOnExpire: true,
    });
  }

  protected abstract getAllFiles(cb: (err: Error | undefined, files: string[] | undefined) => void): void;

  protected abstract getUserAndTemplateId(filename: string): UserAndTemplateId | undefined;

  public abstract saveOnBackend(
    user: string,
    templateId: string,
    content: string,
    cb: (err: Error | undefined) => void,
  ): void;

  public abstract deleteFromBackend(user: string, templateId: string, cb: (err: Error | undefined) => void): void;

  public abstract readTemplateOnBackend(
    user: string,
    templateId: string,
    cb: (err: Error | undefined, readContent: any) => void,
  ): void;

  public abstract hasBackend(): boolean;

  public abstract checkHealth(cb: (err: Error | undefined) => void): void;

  public getVersion(): string {
    try {
      return (this.rosaeNlgFeatures as RosaeNlgFeatures).getRosaeNlgVersion();
    } catch (e) {
      console.log({
        action: 'version',
        message: `cannot get version: ${(e as Error).message}`,
      });
      const err = new Error();
      err.name = '500';
      err.message = (e as Error).message;
      throw err;
    }
  }

  public readTemplateOnBackendAndLoad(
    user: string,
    templateId: string,
    cb: (err: Error | undefined, templateSha1: string | undefined, rosaeContext: RosaeContext | undefined) => void,
  ): void {
    this.readTemplateOnBackend(user, templateId, (err, templateContent) => {
      if (err) {
        console.warn({
          action: 'load',
          user: user,
          templateId: templateId,
          message: `could not reload: ${err}`,
        });
        cb(err, undefined, undefined);
      } else {
        this.compSaveAndLoad(templateContent, false, (loadErr, templateSha1, rosaeContext) => {
          cb(loadErr, templateSha1, rosaeContext);
        });
      }
    });
  }

  public reloadAllFiles(cb: (err: Error | undefined) => void): void {
    this.getAllFiles((err, files) => {
      if (err) {
        cb(err);
      } else {
        for (const file of files as string[]) {
          const userAndTemplateId = this.getUserAndTemplateId(file);
          if (userAndTemplateId && userAndTemplateId.user && userAndTemplateId.templateId) {
            this.readTemplateOnBackendAndLoad(
              userAndTemplateId.user,
              userAndTemplateId.templateId,
              (_err, _templateSha1) => {
                // do nothing with the error
              },
            );
          } else {
            console.warn({
              action: 'startup',
              message: `invalid file: ${file}`,
            });
          }
        }
        cb(undefined);
      }
    });
  }

  public getFromCacheOrLoad(
    user: string,
    templateId: string,
    askedSha1: string | undefined,
    cb: (err: Error | undefined, cacheValue: CacheValue | undefined) => void,
  ): void {
    if (
      (askedSha1 && this.enableCache && this.isInCacheWithGoodSha1(user, templateId, askedSha1)) ||
      (!askedSha1 && this.enableCache && this.isInCache(user, templateId))
    ) {
      // already in cache with the proper sha1?
      cb(undefined, this.getFromCache(user, templateId));
    } else {
      this.readTemplateOnBackend(user, templateId, (readTemplateErr, templateContent) => {
        if (readTemplateErr) {
          // does not exist: we don't really care
          console.log({
            user: user,
            templateId: templateId,
            action: 'getFromCacheOrLoad',
            message: `error: ${readTemplateErr}`,
          });
          const e = new Error();
          e.name = '404';
          e.message = `${user} ${templateId} not found on backend: ${readTemplateErr.message}`;
          cb(e, undefined);
        } else {
          templateContent.user = user;
          this.compSaveAndLoad(templateContent, false, (compErr, loadedSha1, rosaeContext) => {
            if (compErr) {
              const e = new Error();
              e.name = '400';
              e.message = `no existing compiled content for ${templateId}, and could not compile: ${compErr}`;
              cb(e, undefined);
              return;
            }

            if (askedSha1 && loadedSha1 != askedSha1) {
              const e = new Error();
              e.name = 'WRONG_SHA1'; // don't put directly a 301 here, as it can be a 301 or a 308 when POST
              // leave the <...> as it is parsed for redirection
              e.message = `sha1 do not correspond, read sha1 is <${loadedSha1}> while requested is ${askedSha1}`;
              cb(e, undefined);
              return;
            }

            // everything is ok
            cb(undefined, {
              templateSha1: loadedSha1 as string,
              rosaeContext: rosaeContext as RosaeContext,
            });
          });
        }
      });
    }
  }

  public deleteFromCacheAndBackend(user: string, templateId: string, cb: (err: Error | undefined) => void): void {
    if (this.enableCache) {
      this.deleteFromCache(user, templateId);
    }
    if (this.hasBackend()) {
      this.deleteFromBackend(user, templateId, (err) => {
        if (err) {
          console.log({ user: user, templateId: templateId, action: 'delete', message: `failed: ${err}` });
          const e = new Error();
          e.message = `delete failed: ${err}`;
          cb(e);
          return;
        } else {
          console.log({ user: user, templateId: templateId, action: 'delete', message: `done.` });
          cb(undefined);
          return;
        }
      });
    } else {
      cb(undefined);
    }
  }

  protected getKindOfUuid(): string {
    return `${process.pid}-${Math.floor(Math.random() * 100000)}`; //NOSONAR
  }

  public compSaveAndLoad(
    templateContent: PackagedTemplate,
    alwaysSave: boolean,
    cb: (err: Error | undefined, templateSha1: string | undefined, rosaeContext: RosaeContext | undefined) => void,
  ): void {
    const user = templateContent.user;
    let rosaeContext: RosaeContext;

    // if existing we must enrich first
    if (templateContent.type == 'existing' && !templateContent.src && !templateContent.comp) {
      if (!this.sharedTemplatesUser) {
        cb(new Error('shared templates not activated'), undefined, undefined);
        return;
      } else {
        this.getFromCacheOrLoad(this.sharedTemplatesUser, templateContent.which, undefined, (err, cacheValue) => {
          if (err) {
            cb(new Error(`cannot load shared template: ${templateContent.which}, ${err}`), undefined, undefined);
            return;
          } else {
            const sharedRosaeContent = (cacheValue as CacheValue).rosaeContext.getFullTemplate();
            templateContent.src = sharedRosaeContent.src;
            templateContent.comp = sharedRosaeContent.comp;
            this.compSaveAndLoad(templateContent, alwaysSave, cb);
            // cacheValue.templateSha1
            // what could we do with it?
          }
        });
      }
    } else {
      try {
        rosaeContext = new RosaeContext(templateContent, this.rosaeNlgFeatures as RosaeNlgFeatures);
      } catch (e) {
        console.log({
          user: user,
          action: 'create',
          message: `error creating template: ${(e as Error).message}`,
        });
        const err = new Error();
        err.name = '400';
        err.message = (e as Error).message;
        cb(err, undefined, undefined);
        return;
      }

      const templateId = rosaeContext.getTemplateId();
      if (!templateId) {
        const err = new Error();
        err.name = '400';
        err.message = 'no templateId!';
        cb(err, undefined, undefined);
        console.log({ user: user, action: 'create', message: `no templateId` });
        return;
      } else {
        const templateSha1 = rosaeContext.getSha1();
        const cacheValue: CacheValue = {
          templateSha1: templateSha1,
          rosaeContext: rosaeContext,
        };
        if (this.enableCache) {
          this.setInCache(user as string, templateId, cacheValue, false);
        }
        if (this.hasBackend() && (alwaysSave || rosaeContext.hadToCompile)) {
          this.saveOnBackend(user as string, templateId, JSON.stringify(rosaeContext.getFullTemplate()), (err) => {
            if (err) {
              console.error({
                user: user,
                action: 'create',
                sha1: templateSha1,
                message: `could not save to backend: ${err}`,
              });
              const e = new Error();
              e.name = '500';
              e.message = 'could not save to backend';
              cb(e, undefined, undefined);
              return;
            } else {
              console.log({
                user: user,
                action: 'create',
                sha1: templateSha1,
                message: `saved to backend`,
              });
              cb(undefined, templateSha1, rosaeContext);
              return;
            }
          });
        } else {
          cb(undefined, templateSha1, rosaeContext);
          return;
        }
      }
    }
  }

  public getIdsFromBackend(user: string, cb: (err: Error | undefined, templates: string[] | undefined) => void): void {
    this.getAllFiles((err, files) => {
      if (err) {
        cb(err, undefined);
      } else {
        const ids: string[] = [];
        for (let i = 0; i < (files as string[]).length; i++) {
          const file: string = (files as string[])[i];
          const userAndTemplateId = this.getUserAndTemplateId(file);
          if (userAndTemplateId && userAndTemplateId.user == user && userAndTemplateId.templateId) {
            ids.push(userAndTemplateId.templateId);
          }
        }
        cb(undefined, ids);
      }
    });
  }

  protected getUserAndTemplateIdHelper(filename: string, sep: string): UserAndTemplateId | undefined {
    const splited = filename.split(sep);
    if (splited.length != 2) {
      console.error({
        message: `invalid file: ${splited}`,
      });
      return;
    }
    return { user: splited[0], templateId: splited[1].replace(/\.json$/, '') };
  }

  private checkCacheEnable(): void {
    if (!this.enableCache) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `trying to use cache but enableCache is false`;
      throw err;
    }
  }

  private getCacheKey(user: string, templateId: string): string {
    this.checkCacheEnable();
    const key = JSON.stringify({
      user: user,
      templateId: templateId,
    });

    const currTtl = this.rosaeContextsCache.getTtl(key);
    if (currTtl == undefined) {
      // not in cache yet, don't do anything
    } else if (currTtl == 0) {
      // no TTl, we don't change it
    } else {
      // reset ttl
      this.rosaeContextsCache.ttl(key, this.ttl);
    }

    return key;
  }

  public getFromCache(user: string, templateId: string): CacheValue | undefined {
    this.checkCacheEnable();
    return this.rosaeContextsCache.get(this.getCacheKey(user, templateId));
  }
  public isInCache(user: string, templateId: string): boolean {
    this.checkCacheEnable();
    return this.rosaeContextsCache.has(this.getCacheKey(user, templateId));
  }
  public isInCacheWithGoodSha1(user: string, templateId: string, templateSha1: string): boolean {
    this.checkCacheEnable();
    const cacheValue = this.getFromCache(user, templateId);
    if (!cacheValue) {
      return false;
    } else {
      if (cacheValue.templateSha1 === templateSha1) {
        return true;
      } else {
        return false;
      }
    }
  }

  public setInCache(user: string, templateId: string, cacheValue: CacheValue, isTemp: boolean): void {
    this.checkCacheEnable();
    let ttl: number;
    if (isTemp || this.forgetTemplates) {
      ttl = this.ttl;
    } else {
      ttl = 0;
    }
    this.rosaeContextsCache.set(this.getCacheKey(user, templateId), cacheValue, ttl);
  }
  public deleteFromCache(user: string, templateId: string): void {
    this.checkCacheEnable();
    this.rosaeContextsCache.del(this.getCacheKey(user, templateId));
  }
  public getIdsInCache(user: string): string[] {
    this.checkCacheEnable();
    const cacheKeys = Array.from(this.rosaeContextsCache.keys());
    const ids: string[] = [];
    for (let i = 0; i < cacheKeys.length; i++) {
      const rawCacheKey = cacheKeys[i];
      const cacheKey: CacheKey = JSON.parse(rawCacheKey);
      // we don't keep temp ones
      if (cacheKey.user == user && this.rosaeContextsCache.getTtl(rawCacheKey) == 0) {
        ids.push(cacheKey.templateId);
      }
    }
    return ids;
  }

  // for debug only
  /*
  public getAllKeys(): string[] {
    return Array.from(this.rosaeContextsCache.keys());
  }
  */
}
