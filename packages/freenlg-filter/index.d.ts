declare module 'compromise';
declare module 'better-title-case';
declare module 'titlecase-french';

declare interface String {
  applyFilters(toApply: Array<string>, language: string): string;
}

