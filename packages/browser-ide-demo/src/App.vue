<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
<template>
<div id="app" :class="[{'collapsed' : collapsed}]">

  <div class="container">
    <div class="column left">
      <div>Edit your RosaeNLG template:
        <span v-if="this.exampleName"><em>based on "{{this.exampleName}}"</em></span>
        {{this.language}}
      </div>
      <editor v-bind:code="code" v-on:code-change="userChangedCode($event)" />
    </div>
    <div class="column right">
      <input type="checkbox" id="autoRender" v-model="autoRender">
      <label for="autoRender">Render automatically</label>
      <button v-if="!autoRender" type="button" id="render" v-on:click="compileRender()">Render</button>
      <br/>
      <br/>
      <rendered :logs='logs' :errors='errors' :rendered='rendered' />
    </div>
  </div>

  <sidebar 
    :examples='exampleNames'
    :initialCollapsed='false' 
    v-on:menu-collapse="collapsed = $event"
    v-on:select-example="selectExample($event)"
    v-on:save-text="saveAsText();"
    v-on:export-json="exportJSON();"
    v-on:export-browser="exportJavaScript(false);"
    v-on:export-node="exportJavaScript(true);"
    v-on:change-language="selectLanguage($event);"
    v-on:new-template="requestNewTemplate()"
  />
  <VueSimpleAlert />

</div>
</template>

<script>
import Editor from './components/Editor.vue'
import Rendered from './components/Rendered.vue'
import Sidebar from './components/Sidebar.vue'
import VueSimpleAlert from 'vue-simple-alert'


import rosaenlgInfo from '../../rosaenlg/package.json'

import templates from './assets/templates.js'

export default {
  name: 'App',
  components: {
    Editor,
    Rendered,
    Sidebar,
    VueSimpleAlert,
  },
  data() {
    return {
      code: '',
      rendered: '',
      errors: '',
      logs: '',
      language: 'en_US', // must have an initial value
      exampleName: '',
      initialCode: null,
      publicPath: process.env.BASE_URL,
      collapsed: false,
      autoRender: true,
    }
  },
  watch: {
    autoRender: function(val) {
      if (val) {
        this.compileRender();
      }
    }
  },
  computed: {
    examples: function() {
      // console.log('updated examples');
      return templates[this.language];
    },
    exampleNames: function() {
      const res = [];
      for (let i = 0; i < this.examples.length; i++) {
        res.push(this.examples[i][0]);
      }
      // console.log('updated exampleNames: ' + res);
      return res;
    }
  },
  mounted: function () {
    this.setLanguage(this.language);
  },
  methods: {
    requestNewTemplate() {
      if (!this.codeHasChanged()) {
        this.newTemplate();
      } else {
        VueSimpleAlert.confirm('Discard changes?', null, 'warning').then(() => {
          this.newTemplate();
        }, () => {});
      }

    },
    newTemplate() {
      this.exampleName = '';

      this.initialCode = '| hello';
      this.code = this.initialCode;

      this.compileRender();
    },
    codeHasChanged() {
      // line feeds varry
      return this.code.replace(/\r?\n|\r/g, '\n') != this.initialCode.replace(/\r?\n|\r/g, '\n');
    },
    selectLanguage(selectedLanguage) {
      if (this.language != selectedLanguage) {
        // https://github.com/RosaeNLG/rosaenlg/issues/3
        const isFfAndDe = navigator.userAgent.search('Firefox') > -1 && selectedLanguage === 'de_DE';
        if (isFfAndDe) {
          VueSimpleAlert.alert('German compilation inside the browser is not available when using Firefox. Please use Chrome or a modern version of Edge.');
        } else {
          if (!this.codeHasChanged()) {
            this.setLanguage(selectedLanguage);
          } else {
            VueSimpleAlert.confirm('Discard changes?', null, 'warning').then(() => {
              this.setLanguage(selectedLanguage);
            }, () => {});
          }
        }
      }
    },
    selectExample(selectedExample) {
      if (!this.codeHasChanged()) {
        this.setExample(selectedExample);
      } else {
        VueSimpleAlert.confirm('Discard changes?', null, 'warning').then(() => {
          this.setExample(selectedExample);
        }, () => {});
      }
    },
    userChangedCode(newCode) {
      this.code = newCode;
      if (this.autoRender) {
        this.compileRender();
      }
    },
    setLanguage(language) {
      this.language = language;
      this.loadRosaeLib(() => {
        // this.exampleName = this.examples[0][0];
        this.setExample(this.examples[0][0]);
      });

    },
    loadRosaeLib(cb) {
      let loaded = false;

      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.src = `${this.publicPath}rosaenlg_tiny_${this.language}_${rosaenlgInfo.version}_comp.js`;
      script.type = 'text/javascript';
      // script.async = true;
      script.onload = script.onreadystatechange = function() {
        //console.log( this.readyState ); //uncomment this line to see which ready states are called.
        if ( !loaded && (!this.readyState || this.readyState == 'complete') ) {
          loaded = true;
          // console.log('LOADED DONE');
          cb();
        }
      };
      head.appendChild(script);
    },
    getCleanName() {
      return this.exampleName.replace(/[^\w]/gi, '');
    },
    userDownload(filename, content) {
      // thanks to https://discuss.codemirror.net/t/implementing-save-clear-buttons-solved/1280
      const downloadLink = document.createElement('a');
      downloadLink.download = filename;

      // hidden link title name
      downloadLink.innerHTML = 'LINKTITLE';

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(content);

      downloadLink.onclick = (event) => {
        document.body.removeChild(event.target);
        this.logs = `download ${filename} done`;
      };

      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
    },
    exportJavaScript(withExport) {
        const name = this.getCleanName();

        const staticFs = {};
        staticFs[`${name}.pug`] = this.code;
        const compiled = this.getPackager().compileTemplateToJsString(
          `${name}.pug`,
          this.language,
          staticFs,
          this.getFctsHolder(),
          withExport,
        );

        const contentAsBlob = new Blob([compiled], {
          type: 'text/javascript',
        });
        this.userDownload(`${name}.js`, contentAsBlob);
    },
    getPackager() {
      return window['rosaenlgPackager'];
    },
    exportJSON() {
      const name = this.getCleanName();

      const packaged = {
        templateId: name,
        src: {
          entryTemplate: `${name}.pug`,
          templates: {},
          compileInfo: {
            activate: true,
            compileDebug: false,
            language: this.language,
          },
        },
      };
      packaged.src.templates[`${name}.pug`] = this.code;

      this.getPackager().completePackagedTemplateJson(packaged, this.getFctsHolder());

      const contentAsBlob = new Blob([JSON.stringify(packaged)], { type: 'application/json' });
      this.userDownload(`${name}.json`, contentAsBlob);
    },
    saveAsText() {
      const textFileAsBlob = new Blob([this.code], /*{ type: 'text/plain' }*/);
      this.userDownload(`${this.getCleanName()}.pug`, textFileAsBlob);
    },
    resetRendered() {
      this.errors = '';
      this.logs = '';
      this.rendered = '';
    },
    getExampleCode(name) {
      for (let i = 0; i < this.examples.length; i++) {
        if (this.examples[i][0] == name) {
          return this.examples[i][1];
        }
      }
      return null;
    },      
    setExample(exampleName) {
      this.exampleName = exampleName;
      // console.log(`setExample ${this.exampleName}`);
      this.initialCode = this.getExampleCode(this.exampleName);
      this.code = this.initialCode; // patchy
      // console.log(this.initialCode);
      this.compileRender();
    },

    getFctsHolder() {
      return window['rosaenlg_' + this.language];
    },

    compileRender() {
      this.resetRendered();
      try {
        const fctsHolder = this.getFctsHolder();
        const rendered = fctsHolder.render(this.code, {
          language: this.language,
        });
        // this.errors = '';
        this.logs = 'done!';
        this.rendered = rendered;
      } catch (e) {
        this.errors = e.toString().replace(/(\r\n|\n|\r)/gm, '<br/>');
        // this.logs = '';
        // this.rendered = '';
      }
    },
  }

}
</script>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.column {
  float: left;
  padding-left: 10px;
  padding-right: 10px;
}

.left {
  width: 65%;
}

.right {
  width: 30%;
}

button#render {
  display: block;
  width: 100%;
  border: none;
  background-color: #4CAF50;
  padding: 14px 28px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

</style>
