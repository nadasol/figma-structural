<template>
  <div>
    <!-- LOAD CSV -->
    <div>
      <input ref="csv" type="file" name="csv">
      <button type="button"
        @click="load"
      >
        Load Pages
      </button>
    </div>
    <button class="button button--primary" @click="selectedTab = 1">Pages</button>
    <button class="button button--primary" @click="selectedTab = 2">Settings</button>
    <button class="button button--primary" @click="selectedTab = 3">Debug</button>
    <div class="divider"></div>
    <!-- PAGES TAB -->
    <div v-show="selectedTab === 1">
      <div v-if="pageConfig" class="pages">
        <form @submit.prevent="handleCreate()">
          <div v-for="page in pageConfig" :key="page.name" class="page">
            <label :class="[isParent(page) ? 'page__parent' : 'page__child', {'page-selected' : !isParent(page) && isSelected(page)}]">
            <span class="text" v-if="!isParent(page)">{{childrenStyle}}</span>
            <span class="text">{{page.name}}</span>
          </label>
          <input v-if="!isParent(page) && !page.exists" type="checkbox" class="checkbox page__checkbox" v-model="page.input">
          <span v-else-if="!isParent(page) && page.exists">some icon</span>
        </div>
        <input type="submit" value="create">
        </form>
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
      <!-- <button
        class="button button--primary"
        @click="listPages"
      >
      List Pages
      </button> -->
      <p class="type type--pos-small-normal">
        {{message}}
      </p>
      <!-- DEBUG Output -->
        figmaPages:
        <!-- <ul v-if="figmaPages">
          <li v-for="name in figmaPages" :key="name">
            <pre>{{name}}</pre>
          </li>
        </ul> -->
        template:
        <pre>{{template}}</pre>
        pageConfig:
        <pre>{{pageConfig}}</pre>
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
      selectedTab: 1,
      // Template loaded from a CSV file. This is the static reference and should not be modified.
      template: null,
      // Actual current status of figma pages on the project. Updated when loading plugin, not realtime.
      figmaPages: [],
      // Example result from loading a CSV file
      // template: [
      //   { type: "P", name: "🔺 Cover" },
      //   { type: "C", name: "Stakeholders" },
      //   { type: "C", name: "Requirements" },
      //   { type: "P", name: "🔹 Concept" },
      //   { type: "C", name: "“Wireframes" },
      //   { type: "C", name: "Prototypes" },
      //   { type: "P", name: "🔸  UI" },
      //   { type: "C", name: "Benchmarking" },
      //   { type: "C", name: "Design Exploration" },
      //   { type: "P", name: "✅  Handover" },
      //   { type: "C", name: "Final Designs" }
      // ],
      // Combination object of template and figma pages. Lists all pages from template with additional information: whether the page exists, and whether it should be added.
      pageConfig: [],
      childrenStyle: "↳"
    };
  },
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();

    // Fetch current pages from project
    dispatch("getPages");
    // Handle result from above dispatch
    handleEvent("setPages", pageNames => {
      this.figmaPages = pageNames
    })

    // Placeholder: Load template

    // Handle result from syncTemplateToPages dispatch
    handleEvent("syncComplete", result => {
      this.pageConfig = result
    })
  },
  methods: {
    createNode(config) {
      dispatch("createPage", config);
    },
    createNodes(configs){
      dispatch("createPages", configs);
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
    createPageAtIndex() {
      dispatch("createPageAtIndex");
    },
    isParent(page) {
      return page.type === 'P'
    },
    isSelected(page) {
      return page.input;
    },
    load() {
      this.readFile((output) => {
          this.template = _.get(Papa.parse(output, { skipEmptyLines: true, header: true }), "data");
        dispatch("syncTemplateToPages", this.template);
      });
      // Compare template and existing pages
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
    handleCreate() {
      this.createNodes(this.pageConfig)
      // this.pageConfig.forEach((config) => {
      //   this.createNode(config)
      // })
    }
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";

.pages {
  margin: 16px;
}

.page {
  display: flex;
  justify-content: space-between;
  margin: 16px;
}

.text {
  font-family: $font-stack;
  font-size: $font-size-small;
  line-height: $font-lineheight;
  letter-spacing: $font-letterspacing-pos-small;
}

.page__parent {
  font-weight: bold;
  color: $figma-black-8;
}

.page__child {
  color: $figma-black-3;
  margin-left: 16px;
}

.page__checkbox {
  height: unset;
}

.page-selected {
  color: $figma-blue;
}
</style>
