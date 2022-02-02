import { dispatch, handleEvent } from './codeMessageHandler';

figma.showUI(__html__);
figma.ui.resize(600,600)

const root = figma.root

// Example method
// The following shows how messages from the UI code can be handled in the main code.
handleEvent('createNode', () => {
	const node = figma.createRectangle();
	node.name = node.id;

	// This shows how the main code can send messages to the UI code.
	dispatch('nodeCreated', node.id);
});

// WIP: create multiple pages according to template array
handleEvent('createPagesFromTemplate', template => {
  template.forEach(element => {
    const page = figma.createPage();
    // const prefix = element.type === 'C' ? '↳ ' : ''
    const prefix = ""
    page.name = prefix + element.name
  });
});

// Get all currently existing pages on the figma project
handleEvent('getPages', () => {
  console.log('root.children: ', root.children)
	const pageNames = root.children.map(page => page.name);
	dispatch('setPages', pageNames);
});

// Returns an extended template, with the property "exists" added
handleEvent('syncTemplateToPages', template => {
  let result = template
  result.forEach((page, index) => {
    result[index].exists = doesPageExistByName(page.name)
  })
	dispatch('syncComplete', result);
});

// Returns true if there is a page with the passed name
function doesPageExistByName (pageName) {
  const pageExists = root.children.some(page => page.name === pageName)
  console.log('Checking... page', pageName, ' does exist: ', pageExists)
  return pageExists
}

// WIP: Create a page with random number in name
handleEvent('createPage', () => {
	const page = figma.createPage();
	page.name = 'Test Page ' + Math.floor(Math.random() * 1000);;
});

// WIP: Insert a page at index. Currently just a static index
handleEvent('createPageAtIndex', () => {
	root.insertChild(2, figma.createPage())
});

// BUG: Removes all pages BELOW the currently selected page, not all pages except first
// Remove all pages except the first (it seems there always has to be at least one page)
handleEvent('removeAllPages', () => {
	root.children.forEach((node, index) => {
    if (index > 0) {
      node.remove()
    }
  });
});
