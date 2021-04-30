/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

//-------- allows core to communicate with the inner of the template mechanic

const spy = {
  getPugHtml: function () {
    return pug_html;
  },
  getPugMixins: function () {
    return pug_mixins;
  },
  setPugHtml: function (new_pug_html) {
    pug_html = new_pug_html;
  },
  appendPugHtml: function (append) {
    pug_html = pug_html + append;
  },
  appendDoubleSpace: function () {
    pug_html = pug_html + '  ';
  },

  getEmbeddedLinguisticResources: function () {
    return embeddedLinguisticResources;
  },

  // we should avoid this one as util. is already available
  isEvaluatingEmpty: function () {
    return util.saveRollbackManager.isEvaluatingEmpty;
  },

  isEvaluatingChoosebest: function () {
    return util.saveRollbackManager.isEvaluatingChoosebest;
  },
};
