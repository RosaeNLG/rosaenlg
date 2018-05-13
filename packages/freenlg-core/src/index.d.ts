
declare module 'compromise';
declare module 'jslingua';
declare module 'random-js';
declare module 'format-number-french';
declare module 'written-number';

interface String {
  unprotect(mappings): string;
  protectHtmlEscapeSeq(): string;
  unProtectHtmlEscapeSeq(): string;
  protectBlocks(): Object;
  applyFilters(toApply: Array<string>, language: string): string;
}

interface PugMixins {
  insertValUnescaped(val: string): void;
  insertVal(val: string): void;
  value(obj: any, params: any): void;
}

interface Spy {
  appendDoubleSpace(): void;
  getPugHtml(): string;
  getPugMixins(): PugMixins;
  setPugHtml(new_pug_html: string): void;
  appendPugHtml(append: string): void;
  appendDoubleSpace(): void;
  isEvaluatingEmpty(): boolean;
}
