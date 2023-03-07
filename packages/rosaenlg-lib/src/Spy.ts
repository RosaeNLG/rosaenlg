/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpyI {
  getPugHtml(): string;
  setPugHtml(newPugHtml: string): void;
  appendPugHtml(append: string): void;
}

export class SpyNoPug implements SpyI {
  private stringBuffer: string;
  constructor() {
    this.stringBuffer = '';
  }
  public getPugHtml(): string {
    return this.stringBuffer;
  }
  public setPugHtml(newPugHtml: string): void {
    this.stringBuffer = newPugHtml;
  }
  public appendPugHtml(append: string): void {
    this.stringBuffer = this.stringBuffer + append;
  }
}
