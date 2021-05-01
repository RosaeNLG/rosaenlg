/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

//-------- allows core to communicate with the inner of the template mechanic already used by Pug (i.e. pug_html)

util.setSpy({
  getPugHtml: function () {
    return pug_html;
  },
  setPugHtml: function (new_pug_html) {
    pug_html = new_pug_html;
  },
  appendPugHtml: function (append) {
    pug_html = pug_html + append;
  },
});

util.setEmbeddedLinguisticResources(embeddedLinguisticResources);
