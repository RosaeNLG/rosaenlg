/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

declare module 'numeral';

declare interface PugMixins {
  value(obj: any, params: any): void;
}

declare interface Spy {
  getPugHtml(): string;
  setPugHtml(newPugHtml: string): void;
  appendPugHtml(append: string): void;
  getEmbeddedLinguisticResources(): any;
}
