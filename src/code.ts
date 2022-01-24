import { dispatch, handleEvent } from './codeMessageHandler';

figma.showUI(__html__);

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
    const prefix = element.type === 'C' ? '↳ ' : ''
    page.name = prefix + element.name
  });
});

// Returns true if there is a page with the passed name
handleEvent('doesPageExistByName', pageName => {
  const pageExists = root.children.some(page => page.name === pageName)
  console.log('Page', pageName, ' does exist: ', pageExists)
  return pageExists
});

// WIP: Create a page with random number in name
handleEvent('createPage', () => {
	const page = figma.createPage();
	page.name = 'Test Page ' + Math.floor(Math.random() * 1000);;
	dispatch('pageCreated', page.name);
});

// WIP: Insert a page at index. Currently just a static index
handleEvent('createPageAtIndex', () => {
	root.insertChild(2, figma.createPage())
});

// Remove all pages except the first (it seems there always has to be at least one page)
handleEvent('removeAllPages', () => {
	root.children.forEach((node, index) => {
    if (index > 0) {
      node.remove()
    }
  });
});

// Get all currently existing pages
handleEvent('getPages', () => {
  console.log('root.children: ', root.children)
	const pageNames = root.children.map(page => page.name);
	dispatch('setPages', pageNames);
});
