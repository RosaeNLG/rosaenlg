window.onload = function () {
  Vue.use(VueCodemirror, {});

  new Vue({
    el: '#app',
    data: {
      code: '',
      errors: '',
      logs: '',
      rendered: '',

      renderingMode: 'raw',

      cmOption: {
        mode: 'pug',
        tabSize: 2,
        indentWithTabs: false,
        lineNumbers: true,
        viewportMargin: Infinity,
        extraKeys: {
          Tab: 'indentMore',
          'Shift-Tab': 'indentLess',
        },
      },
      examples: templates[language],
      exampleName: 'fruits',
      didNotConfirm: false,
    },
    computed: {
      renderingButtonLabel: function () {
        if (this.renderingMode == 'raw') {
          return 'show as html';
        }
        if (this.renderingMode == 'html') {
          return 'show raw';
        }
      },
      renderedPreVisibility: function () {
        if (this.renderingMode == 'raw') {
          return 'block';
        } else {
          return 'none';
        }
      },
      renderedHtmlVisibility: function () {
        if (this.renderingMode == 'html') {
          return 'block';
        } else {
          return 'none';
        }
      },
    },
    mounted: function () {
      this.setExample();
    },
    methods: {
      getExampleCode(name) {
        for (let i = 0; i < this.examples.length; i++) {
          if (this.examples[i][0] == name) {
            return this.examples[i][1];
          }
        }
        return null;
      },

      changeRenderingMode() {
        switch (this.renderingMode) {
          case 'raw': {
            this.renderingMode = 'html';
            break;
          }
          case 'html': {
            this.renderingMode = 'raw';
            break;
          }
        }
      },

      userDownload(filename, content) {
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

      save() {
        // thanks to https://discuss.codemirror.net/t/implementing-save-clear-buttons-solved/1280
        const textFileAsBlob = new Blob([this.code], { type: 'text/plain' });
        this.userDownload(`${this.exampleName}.pug`, textFileAsBlob);
      },

      getCleanName() {
        return this.exampleName.replace(/[^\w]/gi, '');
      },

      packageJson() {
        const name = this.getCleanName();

        const package = {
          src: {
            templateId: name,
            entryTemplate: `${name}.pug`,
            templates: {},
            compileInfo: {
              activate: true,
              compileDebug: false,
              language: language,
            },
          },
        };
        package.src.templates[`${name}.pug`] = this.code;

        rosaenlgPackager.completePackagedTemplateJson(package, this.getFctsHolder());

        const contentAsBlob = new Blob([JSON.stringify(package)], { type: 'application/json' });
        this.userDownload(`${name}.json`, contentAsBlob);
      },

      packageJs(withExport) {
        const name = this.getCleanName();

        const staticFs = {};
        staticFs[`${name}.pug`] = this.code;
        const compiled = rosaenlgPackager.compileTemplateToJsString(
          `${name}.pug`,
          language,
          staticFs,
          this.getFctsHolder(),
          withExport,
        );

        const contentAsBlob = new Blob([compiled], {
          type: 'text/javascript',
        });
        this.userDownload(`${name}.js`, contentAsBlob);
      },

      getFctsHolder() {
        switch (language) {
          case 'fr_FR': {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return rosaenlg_fr_FR;
          }
          case 'de_DE': {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return rosaenlg_de_DE;
          }
          case 'it_IT': {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return rosaenlg_it_IT;
          }
          case 'en_US': {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return rosaenlg_en_US;
          }
          case 'OTHER': {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return rosaenlg_OTHER;
          }
        }
      },

      compileRender() {
        pugTemplate = this.code;
        try {
          const fctsHolder = this.getFctsHolder();
          const rendered = fctsHolder.render(pugTemplate, {
            language: language,
          });
          this.errors = '';
          this.logs = 'done!';
          this.rendered = rendered;
        } catch (e) {
          this.errors = e.toString().replace(/(\r\n|\n|\r)/gm, '<br/>');
          this.logs = '';
          this.rendered = '';
        }
      },
      setExample() {
        //console.log(`setExample ${this.exampleName}`);
        this.code = this.getExampleCode(this.exampleName);
        this.errors = '';
        this.logs = '';
        this.rendered = '';
        this.compileRender();
      },
    },
    watch: {
      exampleName: function (newName, oldName) {
        if (this.didNotConfirm) {
          this.didNotConfirm = false;
          //console.log(`${oldName} => ${newName}`);
          document.getElementById('selectExample').value = oldName;
          return;
        }

        //console.log(`${oldName} => ${newName}`);
        const initialContent = this.getExampleCode(oldName).replace(/(\r\n|\n|\r)/gm, '');
        const currentContent = this.code.replace(/(\r\n|\n|\r)/gm, '');
        let conf;
        if (initialContent != currentContent) {
          conf = confirm('Are you sure you want to reset?');
        } else {
          conf = true;
        }
        if (conf) {
          this.setExample();
        } else {
          this.didNotConfirm = true;
          this.exampleName = oldName;
          //console.log('did not confirm');
        }
      },
    },
  });
};
