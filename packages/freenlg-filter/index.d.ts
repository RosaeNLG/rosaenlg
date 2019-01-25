declare module 'compromise';
declare module 'better-title-case';
declare module 'titlecase-french';

declare interface String {
  unprotect(mappings): string;
  protectHtmlEscapeSeq(): string;
  unProtectHtmlEscapeSeq(): string;
  protectBlocks(): Object;
  applyFilters(toApply: Array<string>, language: string): string;
}

