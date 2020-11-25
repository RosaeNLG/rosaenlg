/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


export interface HasSaidMap {
  [key: string]: boolean | string | number;
}

export class SaidManager {
  private hasSaidMap: HasSaidMap;
  //spy: Spy;

  public constructor() {
    this.hasSaidMap = {};
  }
  public getHasSaidMap(): HasSaidMap {
    return this.hasSaidMap;
  }
  public setHasSaidMap(hasSaidMap: HasSaidMap): void {
    this.hasSaidMap = hasSaidMap;
  }

  public recordSaid(key: string): void {
    if (!key) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'recordSaid has null arg';
      throw err;
    }
    this.hasSaidMap[key] = true;
  }

  public deleteSaid(key: string): void {
    if (this.hasSaid(key)) {
      delete this.hasSaidMap[key];
    }
  }

  public hasSaid(key: string): boolean {
    if (!key) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'hasSaid has null arg';
      throw err;
    }
    const val = this.hasSaidMap[key];
    if (val == null) {
      return false;
    } else {
      if (typeof val !== 'boolean') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `hasSaid value is not a boolean but ${val}`;
        throw err;
      } else {
        return val;
      }
    }
  }

  public recordValue(key: string, value: boolean | string | number): void {
    if (!key) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'recordValue has null key arg';
      throw err;
    }
    if (typeof value !== 'boolean' && typeof value !== 'string' && typeof value !== 'number') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'recordValue has invalid value arg, must be boolean, string or number';
      throw err;
    }
    this.hasSaidMap[key] = value;
  }
  public getValue(key: string): boolean | string | number {
    if (typeof key === 'undefined' || key === null) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'getValue has null arg';
      throw err;
    }
    return this.hasSaidMap[key];
  }
  public deleteValue(key: string): void {
    this.getValue(key); // just to test the key
    this.hasSaidMap[key] = null;
  }

  public getDumpHasSaid(): string {
    return JSON.stringify(this.hasSaidMap);
  }

  /* istanbul ignore next */
  public dumpHasSaid(): void {
    console.log(this.getDumpHasSaid());
  }

  public getHasSaidCopy(): HasSaidMap {
    return Object.assign({}, this.hasSaidMap);
  }
}
