export interface HasSaidMap {
  [key: string]: any;
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
      this.hasSaidMap[key] = null;
    }
  }

  public hasSaid(key: string): boolean {
    if (!key) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'hasSaid has null arg';
      throw err;
    }
    return this.hasSaidMap[key] || false;
  }

  public getDumpHasSaid(): string {
    return JSON.stringify(this.hasSaidMap);
  }

  /* istanbul ignore next */
  public dumpHasSaid(): void {
    console.log(this.getDumpHasSaid());
  }
}
