import { dispatch, handleEvent } from './codeMessageHandler';
figma.showUI(__html__);
const root = figma.root
// The following shows how messages from the UI code can be handled in the main code.
handleEvent('createNode', () => {
	const node = figma.createRectangle();
	node.name = node.id;

	// This shows how the main code can send messages to the UI code.
	dispatch('nodeCreated', node.id);
});
// 
handleEvent('createPage', () => {
	const page = figma.createPage();
	page.name = 'test Page';

	// This shows how the main code can send messages to the UI code.
	dispatch('pageCreated', page.name);
});
handleEvent('getPages', () => {
	const pageNames = root.children.map(page => figma.getNodeById(page.id).name);
	// This shows how the main code can send messages to the UI code.
	dispatch('setPages', pageNames);
});