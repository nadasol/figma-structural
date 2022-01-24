<template>
  <div>
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
      Template:
      <ul v-if="template">
        <li v-for="page in template" :key="page.name">
          <pre>{{page.name}} {{doesPageExistByName(page.name)}}</pre>
        </li>
      </ul>
  </div>
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";

// Add these lines to import the interactive figma-ui components as needed.
import "./figma-ui/js/selectMenu";
import "./figma-ui/js/iconInput";
import "./figma-ui/js/disclosure";

export default {
  data() {
    return {
      message: "",
      pageNames: [],
      // Example result from loading a CSV file
      template: [
        { type: "P", name: "🔺 Cover" },
        { type: "C", name: "Stakeholders" },
        { type: "C", name: "Requirements" },
        { type: "P", name: "🔹 Concept" },
        { type: "C", name: "“Wireframes" },
        { type: "C", name: "Prototypes" },
        { type: "P", name: "🔸  UI" },
        { type: "C", name: "Benchmarking" },
        { type: "C", name: "Design Exploration" },
        { type: "P", name: "✅  Handover" },
        { type: "C", name: "Final Designs" }
      ]
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
    }
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
</style>
