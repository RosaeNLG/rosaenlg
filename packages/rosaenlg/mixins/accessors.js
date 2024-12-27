/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

//-------- using GenderNumberManager

function setRefGender(obj, gender) {
  util.genderNumberManager.setRefGender(obj, gender, null);
}

function getRefGender(obj) {
  return util.genderNumberManager.getRefGender(obj);
}

function setRefNumber(obj, number) {
  util.genderNumberManager.setRefNumber(obj, number);
}

function getRefNumber(obj) {
  return util.genderNumberManager.getRefNumber(obj);
}

function setRefGenderNumber(obj, gender, number) {
  util.genderNumberManager.setRefGenderNumber(obj, gender, number);
}

function getAnonymous(gender, number) {
  return util.genderNumberManager.getAnonymous(gender, number);
}
function getAnonMS() {
  return util.genderNumberManager.getAnonMS();
}
function getAnonMP() {
  return util.genderNumberManager.getAnonMP();
}
function getAnonFS() {
  return util.genderNumberManager.getAnonFS();
}
function getAnonFP() {
  return util.genderNumberManager.getAnonFP();
}

//-------- using RefsManager

function resetRep(obj) {
  util.refsManager.resetRep(obj);
}

function hasTriggeredRef(obj) {
  return util.refsManager.hasTriggeredRef(obj);
}

function setTriggeredRef(obj) {
  util.refsManager.setTriggeredRef(obj);
}

function dumpRefMap() {
  util.refsManager.dumpRefMap();
}

function getNextRep(obj, params) {
  return util.refsManager.getNextRep(obj, params);
}

//-------- using SaidManager

function dumpHasSaid() {
  util.saidManager.dumpHasSaid();
}

function getDumpHasSaid() {
  return util.saidManager.getDumpHasSaid();
}

function getHasSaidCopy() {
  return util.saidManager.getHasSaidCopy();
}

function recordSaid(key) {
  util.saidManager.recordSaid(key);
}

function deleteSaid(key) {
  util.saidManager.deleteSaid(key);
}

function hasSaid(key) {
  return util.saidManager.hasSaid(key);
}

function recordValue(key, value) {
  util.getSaidManager().recordValue(key, value);
}

function deleteValue(key) {
  util.getSaidManager().deleteValue(key);
}

function getValue(key) {
  return util.getSaidManager().getValue(key);
}

//-------- using helper

function hasFlag(params, flag) {
  return util.helper.hasFlag(params, flag);
}

function getFlagValue(params, flag) {
  return util.helper.getFlagValue(params, flag);
}

function protectString(string) {
  return util.helper.protectString(string);
}

function isSentenceStart() {
  return util.helper.isSentenceStart();
}

function getMorF(table, obj) {
  return util.helper.getMFN(table, obj);
}

function getMFN(table, obj) {
  return util.helper.getMFN(table, obj);
}

function getSorP(table, obj) {
  return util.helper.getSorP(table, obj);
}

//-------- using DictManager

function setWordData(word, wordData) {
  util.languageImpl.getDictManager().setWordData(word, wordData);
}

function setAdjData(word, wordData) {
  util.languageImpl.getDictManager().setAdjData(word, wordData);
}

//-------- using VerbManager

function isVerbWithPrefix(verb) {
  // only works for German
  return util.verbsManager.isVerbWithPrefix(verb);
}
