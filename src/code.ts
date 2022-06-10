import { dispatch, handleEvent } from "./codeMessageHandler";

figma.showUI(__html__);
figma.ui.resize(305, 600);

const root = figma.root;

enum PageTypes {
  Parent = "P",
  Child = "C",
}

// Returns true if there is a page with the passed name
function doesPageExistByName(pageName) {
  const pageExists = root.children.some((page) => page.name === pageName);
  console.log("Checking... page", pageName, " does exist: ", pageExists);
  return pageExists;
}

// Returns a list of page names
function getExistingPageNames() {
  return root.children.map((page) => page.name);
}

function createPage(config, index) {
  if (
    (config.type === "P" || config.input) &&
    !doesPageExistByName(config.name)
  ) {
    const page = figma.createPage();
    page.name = config.name;
  }
}

function getIndexByName(name, configs) {
  return configs.findIndex((config) => {
    return config.name === name;
  });
}

function getInsertIndex(index, existingPageNames, configs) {
  let insertIndex;
  for (let i = index; i >= 0; i--) {
    let name = configs[i].name;
    if (existingPageNames.includes(name)) {
      return existingPageNames.indexOf(name) + 1;
    } else {
      insertIndex = i;
    }
  }
  return insertIndex;
}

function createPageAtIndex(index, name) {
  const newPage = figma.createPage();
  newPage.name = name;
  root.insertChild(index, newPage);
}

// Example method
// The following shows how messages from the UI code can be handled in the main code.
handleEvent("createNode", () => {
  const node = figma.createRectangle();
  node.name = node.id;

  // This shows how the main code can send messages to the UI code.
  dispatch("nodeCreated", node.id);
});

// WIP: create multiple pages according to template array
handleEvent("createPagesFromTemplate", (template) => {
  template.forEach((element) => {
    const page = figma.createPage();
    // const prefix = element.type === 'C' ? '↳ ' : ''
    const prefix = "";
    page.name = prefix + element.name;
  });
});

// Get all currently existing pages on the figma project
handleEvent("getPages", () => {
  console.log("root.children: ", root.children);
  const pageNames = getExistingPageNames();
  dispatch("setPages", pageNames);
});

// Returns an extended template, with the property "exists" added
handleEvent("syncTemplateToPages", (data) => {
  let currentParent;
  let configs = data.template;
  configs.forEach((page, index) => {
    if (configs[index].type === PageTypes.Child)
      configs[index].name = data.childrenPrefix + configs[index].name;
    if (page.type === PageTypes.Parent) {
      currentParent = page.name;
      configs[index].parent = null;
    } else {
      configs[index].parent = currentParent;
    }
    configs[index].exists = doesPageExistByName(page.name);
    configs[index].input = false;
  });
  dispatch("syncComplete", configs);
});

handleEvent("createPages", (configs) => {
  let existingPageNames = getExistingPageNames();
  configs
    .filter(
      (config) =>
        config.input === true || existingPageNames.includes(config.name)
    )
    .forEach((config, index) => {
      debugger;
      console.log(
        "Existing page names before inserting new pages: ",
        existingPageNames
      );
      if (config.type === PageTypes.Child) {
        if (!existingPageNames.includes(config.parent)) {
          const parentIndex = getIndexByName(config.parent, configs);
          const insertIndex = getInsertIndex(
            parentIndex,
            existingPageNames,
            configs
          );
          createPageAtIndex(insertIndex, config.parent);
          configs[insertIndex].exists = true;
          existingPageNames = getExistingPageNames();
          console.log(
            "Existing page names after inserting parent: ",
            existingPageNames
          );
          console.log("Inserting parent at index ", insertIndex);
        }
        if (!existingPageNames.includes(config.name)) {
          const childIndex = getIndexByName(config.name, configs);
          const insertIndex = getInsertIndex(
            childIndex,
            existingPageNames,
            configs
          );
          createPageAtIndex(insertIndex, config.name);
          configs[insertIndex].exists = true;
          existingPageNames = getExistingPageNames();
          console.log(
            "Existing page names after inserting child: ",
            existingPageNames
          );
          console.log("Inserting child at index ", insertIndex);
        }
      }
    });
});

handleEvent("createPageAtIndex", (index = -1, name = "default") => {
  createPageAtIndex(index, name);
});

handleEvent("removeAllPages", () => {
  root.children.forEach((node, index) => {
    if (index > 0) {
      node.remove();
    }
  });
});
