<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
# RosaeNLG Browser POC

Client side (in browser) NLG using RosaeNLG.

This technical POC shows how to generate texts in client side, _in a browser_, with RosaeNLG, and _without `node.js`_. This project exists for demo and test purposes.

See `browser-ide-demo` for both compiling and rendering in the browser.


## Client side rendering

Compilation occurs on server side when packaging the app. Rendering is made in the browser.


### How it works

The general idea is:

* to author text templates in a defined environment (for instance `node.js` based)
* then to compile and pack the templates
* and to run them in browser based environment, with no connection to the authoring environment (without using `node.js`)

The process is the following:

* `compile_templates_*` in `gulpfile.js/index.js` compiles and packages the template thanks to `rosaenlg-packager` module
* RosaeNLG provides a browser ready package per language, here `rosaenlg_tiny_en_US_VERSION.js` for `en_US`
* `browser_en_US.html` or `browser_fr_FR.html` simply renders the template using sample data, and shows the result


### Usage

* `npm run build` to pack everything
* open `dist/browser_en_US.html` in a browser
* you should see `<p>Apples, bananas and apricots</p>` in the text area - this text is generated on the fly in the browser
