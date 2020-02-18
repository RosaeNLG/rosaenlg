import NodeCache = require('node-cache');
import { RosaeContext } from './RosaeContext';
// import winston = require('winston');

interface CacheKey {
  user: string;
  templateId: string;
}

export interface CacheValue {
  templateSha1: string;
  rosaeContext: RosaeContext;
}

export class RosaeContextsManager {
  private ttl: number;
  private cacheCheckPeriod: number;
  private forgetTemplates: boolean;

  private rosaeContextsCache: NodeCache;

  constructor(forgetTemplates: boolean, specificTtl: number, specificCheckPeriod: number) {
    this.ttl = specificTtl || 600; // 10 minutes
    this.cacheCheckPeriod = specificCheckPeriod || 60; // 1 minute
    // winston.info(`params: ttl=${this.ttl}, cacheCheckPeriod=${this.cacheCheckPeriod}`);

    this.forgetTemplates = forgetTemplates;

    this.rosaeContextsCache = new NodeCache({
      checkperiod: this.cacheCheckPeriod,
      useClones: false,
      deleteOnExpire: true,
    });

    /*
    this.rosaeContextsCache.on('del', (key, value) => {
      winston.info(`del on ${key}`);
    });
    */
  }

  private getCacheKey(user: string, templateId: string): string {
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

  public getFromCache(user: string, templateId: string): CacheValue {
    return this.rosaeContextsCache.get(this.getCacheKey(user, templateId));
  }
  public isInCache(user: string, templateId: string): boolean {
    return this.rosaeContextsCache.has(this.getCacheKey(user, templateId));
  }
  public setInCache(user: string, templateId: string, cacheValue: CacheValue, isTemp: boolean): void {
    let ttl: number;
    if (isTemp || this.forgetTemplates) {
      ttl = this.ttl;
    } else {
      ttl = 0;
    }
    this.rosaeContextsCache.set(this.getCacheKey(user, templateId), cacheValue, ttl);
  }
  public deleteFromCache(user: string, templateId: string): void {
    this.rosaeContextsCache.del(this.getCacheKey(user, templateId));
  }
  public getIds(user: string): string[] {
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
