declare module 'compromise';
declare module 'random-js';
declare module 'written-number';
declare module 'write-int';
declare module 'numeral';

interface PugMixins {
  insertValUnescaped(val: string): void;
  insertVal(val: string): void;
  value(obj: any, params: any): void;
}

interface Spy {
  appendDoubleSpace(): void;
  getPugHtml(): string;
  getPugMixins(): PugMixins;
  setPugHtml(newPugHtml: string): void;
  appendPugHtml(append: string): void;
  isEvaluatingEmpty(): boolean;
  isEvaluatingChoosebest(): boolean;
  getEmbeddedLinguisticResources(): any;
}
