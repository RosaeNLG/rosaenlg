let currentId = 0;

let toComplete = {};

let freeNlgVersion = '$FREENLG_VERSION'; // replaced by gulp CI

function spawnEditor(lang, template) {
  // create the elements
  let where = document.createElement('div');
  let id = 'editor' + currentId;
  where.setAttribute('id', id);
  currentId++;

  let scripts = document.getElementsByTagName('script');
  let currentScript = scripts[scripts.length - 1];
  //console.log(currentScript);
  currentScript.parentNode.insertBefore(where, currentScript);

  // record them - that's all
  if (toComplete[lang] == null) {
    toComplete[lang] = [];
  }
  toComplete[lang].push([id, template]);
  //console.log(`to complete: ${id}`);
}

window.onload = function() {
  //console.log('onload done' + JSON.stringify(toComplete));
  const langs = Object.keys(toComplete);

  // load the scripts
  for (let i = 0; i < langs.length; i++) {
    let fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', `freenlg_tiny_${langs[i]}_${freeNlgVersion}_comp.js`);
    document.body.appendChild(fileref);
    fileref.onload = function() {
      fillEditorsForLang(langs[i]);
    };
  }
};

// spawn the editors for each elt
function fillEditorsForLang(lang) {
  const editors = toComplete[lang];
  for (let i = 0; i < editors.length; i++) {
    fillEditor(editors[i][0], lang, editors[i][1]);
  }
}

// spawn for real
function fillEditor(id, lang, template) {
  document.getElementById(id).innerHTML = `
    <i>Try it! ({{ language }})</i>
    <codemirror v-model="code" :options="cmOption"></codemirror>
    <button v-on:click="compileRender()">Test =&gt;</button>
    <div class="rendered">{{ rendered }}</div>
    <div class="errors">{{ errors }}</div>`;

  Vue.use(VueCodemirror, {});

  new Vue({
    el: '#' + id,
    data: {
      code: '',
      errors: '',
      rendered: '',
      language: lang,
      cmOption: {
        mode: 'pug',
        tabSize: 2,
        indentWithTabs: false,
        lineNumbers: true,
        viewportMargin: Infinity,
        extraKeys: {
          Tab: function(cm) {
            var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
            cm.replaceSelection(spaces);
          },
        },
      },
    },
    mounted: function() {
      this.code = template;
      this.errors = '';
      this.rendered = '';
      this.compileRender();
    },
    methods: {
      compileRender() {
        let freenlg_module;
        if (this.language == 'en_US') {
          freenlg_module = freenlg_en_US;
        }
        if (this.language == 'fr_FR') {
          freenlg_module = freenlg_fr_FR;
        }
        if (this.language == 'de_DE') {
          freenlg_module = freenlg_de_DE;
        }
        try {
          let rendered = freenlg_module
            .render(this.code, {
              language: this.language,
            })
            .replace(/<\/p>/g, '<p>\r\n\r\n');
          this.errors = '';
          this.rendered = rendered;
        } catch (e) {
          this.errors = e;
          this.rendered = '';
        }
      },
    },
  });
}
