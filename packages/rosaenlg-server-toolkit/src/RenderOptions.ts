import { Languages } from './index';

export class RenderOptions {
  public language: Languages;
  public forceRandomSeed: number | undefined;
  public defaultSynoMode: string | undefined;
  public defaultAmong: string | undefined;

  constructor(copyFrom: any) {
    this.language = copyFrom.language;

    this.forceRandomSeed = copyFrom.forceRandomSeed;
    this.defaultSynoMode = copyFrom.defaultSynoMode;
    this.defaultAmong = copyFrom.defaultAmong;
  }
}
