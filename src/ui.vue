<template>
  <div>
    <!-- LOAD CSV -->
    <div class="section-title">Structural</div>
    <div class="navigation">
      <button
        class="navigation--tab"
        :class="{ 'navigation--tab-selected': selectedTab === 1 }"
        @click="selectedTab = 1"
      >
        Pages
      </button>
      <button
        class="navigation--tab"
        :class="{ 'navigation--tab-selected': selectedTab === 2 }"
        @click="selectedTab = 2"
      >
        Settings
      </button>
      <button
        class="navigation--tab"
        :class="{ 'navigation--tab-selected': selectedTab === 3 }"
        @click="selectedTab = 3"
      >
        Debug
      </button>
    </div>
    <div class="divider"></div>
    <!-- PAGES TAB -->
    <div v-show="selectedTab === 1">
      <div v-if="pageConfig" class="container">
        <form @submit.prevent="handleCreate()">
          <div v-for="page in pageConfig" :key="page.name" class="page">
            <label
              :class="[
                isParent(page) ? 'page__parent' : 'page__child',
                { 'page-selected': !isParent(page) && isSelected(page) },
              ]"
            >
              <span class="text">{{ page.name }}</span>
            </label>
            <input
              v-if="!isParent(page) && !page.exists"
              type="checkbox"
              class="checkbox page__checkbox"
              v-model="page.input"
            />
            <span v-else-if="!isParent(page) && page.exists"
              ><img src="../assets/checkmark.svg"
            /></span>
          </div>
          <button type="button" class="button button-left button--secondary" @click="
            resetPagesInput()
          ">
            Reset
          </button>
          <input
            type="submit"
            value="Create"
            class="button button-right button--primary"
          />
        </form>
      </div>
      <div v-else>There is no template.</div>
    </div>

    <!-- SETTINGS TAB -->
    <div v-show="selectedTab === 2" class="container">
      <div>
        <p class="section-title">Template URL</p>
        <input ref="csv" type="file" name="csv" />
        <p class="section-title">Children Style</p>
        <div v-for="style in childrenStyles" :key="style.title" class="page">
          <input
            type="checkbox"
            class="checkbox page__checkbox"
            v-model="style.selected"
          />
          <label class="text">{{ style.title }}</label>
        </div>
        <button type="button" class="button button-left button--secondary" @click="
            resetSettingsInput()
          ">
          Reset
        </button>
        <button
          type="button"
          class="button button-right button--primary"
          @click="
            openTab(1);
            load();
          "
        >
          Update
        </button>
      </div>
    </div>

    <!-- DEBUG TAB -->
    <div v-show="selectedTab === 3">
      <!-- TEST Buttons -->
      <button class="button button--primary" @click="createNode">
        Create Page
      </button>
      <button class="button button--primary" @click="createPagesFromTemplate">
        Create Pages From Template
      </button>
      <button class="button button--primary" @click="createPageAtIndex">
        Create Page At Index
      </button>
      <button class="button button--primary" @click="removeAllPages">
        Remove all Pages
      </button>
      <!-- <button
        class="button button--primary"
        @click="listPages"
      >
      List Pages
      </button> -->
      <p class="type type--pos-small-normal">
        {{ message }}
      </p>
      <!-- DEBUG Output -->
      figmaPages:
      <!-- <ul v-if="figmaPages">
          <li v-for="name in figmaPages" :key="name">
            <pre>{{name}}</pre>
          </li>
        </ul> -->
      template:
      <pre>{{ template }}</pre>
      pageConfig:
      <pre>{{ pageConfig }}</pre>
    </div>
  </div>
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";
import _ from "lodash";
import Papa from "papaparse";

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
      // Possible prefixes for child pages. If multiple selected, are added according to priority (higher priority followed by lower priority)
      childrenStyles: [
        { title: "Add ↳", prefix: "↳ ", priority: 0, selected: false },
        {
          title: "Include extra spaces",
          prefix: "    ",
          priority: 1,
          selected: false,
        },
      ],
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
    handleEvent("setPages", (pageNames) => {
      this.figmaPages = pageNames;
    });

    // Handle result from syncTemplateToPages dispatch
    handleEvent("syncComplete", (config) => {
      this.pageConfig = config;
    });
  },
  computed: {
    // Calculate prefix of child pages
    childrenPrefix() {
      let prefix = "";
      this.childrenStyles.sort((a, b) => a.priority - b.priority); // sort by priority
      this.childrenStyles.forEach((style) => {
        if (style.selected) prefix = style.prefix + prefix;
      }); //prepend prefix
      return prefix;
    },
  },
  methods: {
    createNode(config) {
      dispatch("createPage", config);
    },
    createNodes(configs) {
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
      return page.type === "P";
    },
    isSelected(page) {
      return page.input;
    },
    openTab(tabIndex) {
      console.log("Opening tab ", tabIndex);
      this.selectedTab = tabIndex;
    },
    load() {
      this.readFile((output) => {
        this.template = _.get(
          Papa.parse(output, { skipEmptyLines: true, header: true }),
          "data"
        );
        dispatch("syncTemplateToPages", {
          template: this.template,
          childrenPrefix: this.childrenPrefix,
        });
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
        reader.onerror = function () {};
      }
    },
    handleCreate() {
      this.createNodes(this.pageConfig);
    },
    // Clear checkboxes on Pages Tab
    resetPagesInput() {
      this.pageConfig.forEach(page => page.input = false)
    },
    // Empty file input and clear checkboxes on Settings Tab
    resetSettingsInput() {
      this.$refs.csv.value = ''
      this.childrenStyles.forEach(style => style.selected = false)
    }
  },
};
</script>

<style lang="scss">
@import "./figma-ui/figma-plugin-ds";

.container {
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

.button-left {
  float: left;
}

.button-right {
  float: right;
}

.navigation--tab {
  all: unset;
  cursor: pointer;

  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-size: 11px;
  line-height: 16px;
  align-items: center;
  letter-spacing: 0.005em;
  margin: 12px 8px;
  color: rgba(0, 0, 0, 0.3);
}

.navigation--tab-selected {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
}
</style>
