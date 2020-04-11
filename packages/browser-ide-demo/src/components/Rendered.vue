<template>
<div class="rendered">
  <div id="logs">{{ logs }}</div>
  <div class="block">
    <div id="errors" class="pre" v-html="errors"></div>
    <div>Rendered texts: <button v-on:click="changeRenderingMode()">{{ renderingButtonLabel }}</button></div>
    <div v-bind:style="{display: renderedPreVisibility}" class="renderedPre">{{ rendered }}</div>
    <div v-bind:style="{display: renderedHtmlVisibility}" class="renderedHtml" v-html="rendered"></div>
  </div>
</div>
</template>

<script>
export default {
  name: 'rendered',
  props: {
    logs: String,
    errors: String,
    rendered: String,
  },
  data() {
    return {
      renderingMode: 'raw',
    }
  },
  computed: {
    renderingButtonLabel: function () {
      if (this.renderingMode == 'raw') {
        return 'show as html';
      } else if (this.renderingMode == 'html') {
        return 'show raw';
      } else {
        return 'ERROR';
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
  methods: {
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
    }
  }
}
</script>

<style scoped>
#logs {
  color: green;
  font-family: monospace;
}

.block {
  padding-top: 10px;
}

#errors {
  color: red;
}

.pre {
  display: block;
  font-family: monospace;
}

.renderedHtml {
  font-family: Arial;
}

.renderedPre {
  display: block;
  font-family: monospace;
}

</style>
