<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
<template>
<div class="sidebar">
  <sidebar-menu width='250px' :menu="menu" :collapsed="collapsed" :theme="'white-theme'" @item-click="onItemClick" @toggle-collapse="onToggleCollapse" />
</div>
</template>

<script>
import {
  SidebarMenu
} from 'vue-sidebar-menu'

import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '../assets/fontawesome/css/all.css'
import rosaenlgInfo from '../../../rosaenlg/package.json'

export default {
  name: 'Sidebar',
  props: {
    examples: Array,
    initialCollapsed: Boolean,
  },
  components: {
    SidebarMenu
  },
  mounted: function () {
    this.collapsed = this.initialCollapsed;
  },
  computed: {    
    examplesMenu: function() {
      const res = [];
      for (const example of this.examples) {
        res.push({
          title: example
        });
      }
      return res;
    },
    
    menu: function() {
      return [{
          header: true,
          title: 'RosaeNLG IDE',
          hiddenOnCollapse: true
        },
        {
          title: 'New template',
          icon: 'fas fa-file',
        },
        {
          title: 'Save template',
          icon: 'fa fa-file-download',
          child: [{
            icon: 'fas fa-file-alt',
            title: 'As text file'
          }]
        },
        {
          title: 'Load example',
          icon: 'fas fa-magic',
          child: this.examplesMenu,
        },
        {
          // href: '/charts',
          title: 'Export',
          icon: 'fa fa-file-export',
          child: [{
              title: 'As JSON',
              icon: 'fas fa-cloud-download-alt',
            },
            {
              title: 'Compiled JavaScript',
              icon: 'fab fa-js-square',
              child: [{
                  // href: '/charts/sublink',
                  icon: 'fab fa-firefox-browser',
                  title: 'for browser'
                },
                {
                  // href: '/charts/sublink',
                  icon: 'fab fa-node-js',
                  title: 'for node.js'
                }
              ]
            }

          ]
        },
        {
          title: 'Change Language',
          icon: 'fa fa-language',
          child: [{
              title: 'English',
              icon: 'fa fa-chess-queen',
            },
            {
              title: 'French',
              icon: 'fa fa-wine-bottle',
            },
            {
              title: 'German',
              icon: 'fa fa-beer',
            },
            {
              title: 'Italian',
              icon: 'fa fa-pizza-slice',
            },
            {
              title: 'Spanish',
              icon: 'fas fa-guitar',
            },
            {
              title: 'Other',
              icon: 'fas fa-kiwi-bird',
            }
          ]
        },
        {
          title: 'Help',
          // href: 'https://rosaenlg.org/rosaenlg/1.14.1/integration/browser_ide.html',
          // external: true,
          icon: 'fa fa-info-circle',
        }
      ]
    },
  },
  methods: {
    onItemClick(_event, item) {
      // is an example?
      if (this.examples.includes(item.title)) {
        this.$emit('select-example', item.title);
      } else {
        switch(item.title) {
          case 'New template':
            this.$emit('new-template');
            break;
          case 'As text file':
            this.$emit('save-text');
            break;
          case 'As JSON':
            this.$emit('export-json');
            break;
          case 'for browser':
            this.$emit('export-browser');
            break;
          case 'for node.js':
            this.$emit('export-node');
            break;
          case 'Help':
            window.open(`https://rosaenlg.org/rosaenlg/${rosaenlgInfo.version}/integration/browser_ide.html`, '_blank');
            break;
          case 'French':
            this.$emit('change-language', 'fr_FR');
            break;
          case 'English':
            this.$emit('change-language', 'en_US');
            break;
          case 'Italian':
            this.$emit('change-language', 'it_IT');
            break;
          case 'Spanish':
            this.$emit('change-language', 'es_ES');
            break;
          case 'German':
            this.$emit('change-language', 'de_DE');
            break;
          case 'Other':
            this.$emit('change-language', 'OTHER');
            break;
        }
      }
    },
    onToggleCollapse (collapsed) {
      this.collapsed = collapsed;
      this.$emit('menu-collapse', this.collapsed);
    },
  },
  data() {
    return {
      collapsed: null,
    }
  }

}
</script>

<style>
#app {
  padding-left: 250px;
}
#app.collapsed {
  padding-left: 50px;
}
</style>
