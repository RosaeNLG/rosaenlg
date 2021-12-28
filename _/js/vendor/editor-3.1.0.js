let currentId = 0

let toComplete = {}

let rosaeNlgVersion = '3.1.0' // replaced automatically by gulp

// eslint-disable-next-line no-unused-vars
function spawnEditor (lang, template, _expectedWeDontCare) {
  // create the elements
  let where = document.createElement('div')
  let id = 'editor' + currentId
  where.setAttribute('id', id)
  currentId++

  let scripts = document.getElementsByTagName('script')
  let currentScript = scripts[scripts.length - 1]
  //console.log(currentScript);
  currentScript.parentNode.insertBefore(where, currentScript)

  // record them - that's all
  if (toComplete[lang] == null) {
    toComplete[lang] = []
  }
  toComplete[lang].push([id, template])
  //console.log(`to complete: ${id}`);
}

// spawn for real
function fillEditor (id, lang, template) {
  const eltWithText = document.getElementById(id)

  // https://github.com/RosaeNLG/rosaenlg/issues/3
  const isFfAndDe = navigator.userAgent.search('Firefox') > -1 && lang === 'de_DE'

  if (isFfAndDe) {
    eltWithText.innerHTML = `
    <p class="WrongBrowser">Inline compiling does not work in Firefox for German. 
    Please use Chrome or a modern Edge version.</p>
    <codemirror v-model="code" :options="cmOption"></codemirror>`
  } else {
    eltWithText.innerHTML = `
    <i>Try it! ({{ language }})</i>
    <codemirror v-model="code" :options="cmOption"></codemirror>
    <button v-on:click="compileRender()">Test =&gt;</button>
    <div class="rendered">{{ rendered }}</div>
    <div class="errors">{{ errors }}</div>`
  }

  // eslint-disable-next-line no-undef
  Vue.use(VueCodemirror, {})

  // eslint-disable-next-line no-new
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
          Tab: 'indentMore',
          'Shift-Tab': 'indentLess',
        },
      },
    },
    mounted: function () {
      this.code = template
      this.errors = ''
      this.rendered = ''
      this.compileRender()
    },
    methods: {
      compileRender () {
        if (!isFfAndDe) {
          let renderFct
          switch (this.language) {
            case 'fr_FR': {
              renderFct = rosaenlg_fr_FR; /* eslint-disable-line */
              break
            }
            case 'de_DE': {
              renderFct = rosaenlg_de_DE; /* eslint-disable-line */
              break
            }
            case 'en_US': {
              renderFct = rosaenlg_en_US; /* eslint-disable-line */
              break
            }
            case 'it_IT': {
              renderFct = rosaenlg_it_IT; /* eslint-disable-line */
              break
            }
            case 'es_ES': {
              renderFct = rosaenlg_es_ES; /* eslint-disable-line */
              break
            }
            case 'OTHER': {
              renderFct = rosaenlg_OTHER; /* eslint-disable-line */
              break
            }
          }
          try {
            let rendered = renderFct
              .render(this.code, {
                language: this.language,
              })
            this.errors = ''
            this.rendered = rendered
          } catch (e) {
            this.errors = e
            this.rendered = ''
          }
        }
      },
    },
  })
}

function getLibUrl (lang) {
  let loc = window.location.href
  let elts = loc.split('/')
  //console.log(elts)
  for (let j = 0; j < elts.length; j++) {
    //console.log(elts[j])
    if (/[0-9]+\.[0-9]+\.[0-9]+/.test(elts[j])) {
      //console.log(j, elts[j], elts.length - j)
      return '../'.repeat(elts.length - j) + `_/js/vendor/rosaenlg_tiny_${lang}_${rosaeNlgVersion}_comp.js`
      //console.log(libUrl)
    }
  }
  return null
}

window.onload = function () {
  //console.log('onload done' + JSON.stringify(toComplete));
  const langs = Object.keys(toComplete)

  // spawn the editors for each elt
  function fillEditorsForLang (lang) {
    const editors = toComplete[lang]
    for (let i = 0; i < editors.length; i++) {
      fillEditor(editors[i][0], lang, editors[i][1])
    }
  }

  // load the scripts
  for (let i = 0; i < langs.length; i++) {
    let fileref = document.createElement('script')
    fileref.setAttribute('type', 'text/javascript')
    fileref.setAttribute('src', getLibUrl(langs[i]))
    document.body.appendChild(fileref)
    fileref.onload = function () {
      fillEditorsForLang(langs[i])
    }
  }
}
