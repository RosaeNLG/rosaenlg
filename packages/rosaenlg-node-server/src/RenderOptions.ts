import { Languages } from 'gulp-rosaenlg';

export class RenderOptions {
  public language: Languages;
  public forceRandomSeed: number | undefined;
  public disableFiltering: boolean | undefined;
  public defaultSynoMode: string | undefined;
  public defaultAmong: string | undefined;

  constructor(copyFrom: any) {
    this.language = copyFrom.language;

    this.forceRandomSeed = copyFrom.forceRandomSeed;
    this.disableFiltering = copyFrom.disableFiltering;
    this.defaultSynoMode = copyFrom.defaultSynoMode;
    this.defaultAmong = copyFrom.defaultAmong;
  }
}
