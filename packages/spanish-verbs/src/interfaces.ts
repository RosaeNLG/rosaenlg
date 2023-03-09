/**
 * @license
 * Copyright 2019 Ludan Stoecklé, 2017, HealthTap, Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

export type Person = 'first' | 'second' | 'third';
export type NumberSP = 'singular' | 'plural';
export type Style = 'castillano' | 'rioplatense' | 'chileano' | 'centroamericano' | 'mexicano' | 'caribeno' | 'andino';
export type Mood = 'indicative' | 'subjunctive' | 'conditional' | 'imperative';
export type Tense =
  | 'present'
  | 'imperfect'
  | 'preterite'
  | 'future'
  | 'perfect'
  | 'pluperfect'
  | 'future perfect'
  | 'preterite perfect'
  | 'imperfect -ra'
  | 'imperfect -se';

export type Positivity = 'affirmative' | 'negative';
export type Formality = 'informal' | 'formal';
