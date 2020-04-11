<template>
<div class="editor">
  <!-- direct @input="$emit..." does not work -->
  <codemirror :options="cmOption" :value="initialCode" @input="onCmCodeChange"></codemirror>
</div>
</template>

<script>
import {
  codemirror
} from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'

import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/pug/pug.js'

export default {
  name: 'Editor',
  components: {
    codemirror
  },
  props: {
    initialCode: String,
  },
  watch: {
    initialCode: function(newVal) {
      // console.log('Prop changed: ', newVal, ' | was: ', oldVal)
      this.$emit('code-change', newVal);
    }
  },
  methods: {
    
    onCmCodeChange(newCode) { // only triggers when the users changes the code
      // console.log('this is new code', newCode);
      this.$emit('code-change', newCode);
    }
    
  },
  data() {
    return {
      // code: '',
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
    }
  }
}
</script>

<style>

.editor .CodeMirror {
  border: 1px solid #eee;
  height: 95vh;
}

</style>
