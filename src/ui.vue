<template>
  <div>
    <button class="button button--primary" @click="selectedTab = 1">Pages</button>
    <button class="button button--primary" @click="selectedTab = 2">Settings</button>
    <button class="button button--primary" @click="selectedTab = 3">Debug</button>
    <!-- PAGES TAB -->
    <div v-show="selectedTab === 1">
      <div v-if="template">
        <ul>
          <li v-for="page in template" :key="page.name">
            <pre>{{page.name}} : {{page.exists}}</pre>
          </li>
        </ul>
      </div>
      <div v-else>There is no template.</div>
    </div>

    <!-- SETTINGS TAB -->
    <div v-show="selectedTab === 2"></div>

    <!-- DEBUG TAB -->
    <div v-show="selectedTab === 3">
      <!-- TEST Buttons -->
      <button
        class="button button--primary"
        @click="createNode"
      >
      Create Page
      </button>
      <button
        class="button button--primary"
        @click="createPagesFromTemplate"
      >
      Create Pages From Template
      </button>
      <button
        class="button button--primary"
        @click="createPageAtIndex"
      >
      Create Page At Index
      </button>
      <button
        class="button button--primary"
        @click="removeAllPages"
      >
      Remove all Pages
      </button>
      <button
        class="button button--primary"
        @click="listPages"
      >
      List Pages
      </button>
      <p class="type type--pos-small-normal">
        {{message}}
      </p>
      <!-- DEBUG Output -->
        pageNames:
        <ul v-if="pageNames">
          <li v-for="name in pageNames" :key="name">
            <pre>{{name}}</pre>
          </li>
        </ul>
        template:
        <pre>{{template}}</pre>
    </div>
  </div>
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";
import _ from 'lodash';
import Papa from 'papaparse';

// Add these lines to import the interactive figma-ui components as needed.
import "./figma-ui/js/selectMenu";
import "./figma-ui/js/iconInput";
import "./figma-ui/js/disclosure";

export default {
  data() {
    return {
      message: "",
      pageNames: [],
      selectedTab: 1,
      // Example result from loading a CSV file
      template: null
    };
  },
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();

    // The following shows how messages from the main code can be handled in the UI code.
    handleEvent("pageCreated", nodeID => {
      this.message = `Node ${nodeID} was created!`;
    });
    handleEvent("setPages", pageNames => {
      this.pageNames = pageNames
    })

    this.template.forEach((page, index) => {
      this.template[index].exists = dispatch("doesPageExistByName", page.name)
    })
  },
  methods: {
    createNode() {
      dispatch("createPage");
    },
    doesPageExistByName(pageName) {
      dispatch("doesPageExistByName", pageName);
    },
    createPagesFromTemplate() {
      dispatch("createPagesFromTemplate", this.template);
    },
    removeAllPages() {
      dispatch("removeAllPages");
    },
    listPages() {
      dispatch("getPages");
    },
    createPageAtIndex() {
      dispatch("createPageAtIndex");
    },
    load() {
      this.readFile((output) => {
          this.template = _.get(Papa.parse(output, { skipEmptyLines: true, header: true }), "data");
      });
    },
    readFile(callback) {
      let file = this.$refs.csv.files[0];
      if (file) {
          let reader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = function (evt) {
              callback(evt.target.result);
          };
          reader.onerror = function () {
          };
      }
    },
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
</style>
