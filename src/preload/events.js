import { ipcRenderer } from 'electron';

export default () => {
	document.addEventListener('dragover', (event) => event.preventDefault());
	document.addEventListener('drop', (event) => event.preventDefault());

	for (const eventName of ['unread-changed', 'get-sourceId']) {
		window.addEventListener(eventName, (event) => ipcRenderer.sendToHost(eventName, event.detail));
	}

	const queryEditFlags = () => ({
		canUndo: document.queryCommandEnabled('undo'),
		canRedo: document.queryCommandEnabled('redo'),
		canCut: document.queryCommandEnabled('cut'),
		canCopy: document.queryCommandEnabled('copy'),
		canPaste: document.queryCommandEnabled('paste'),
		canSelectAll: document.queryCommandEnabled('selectAll'),
	});

	document.addEventListener('selectionchange', () => {
		ipcRenderer.sendToHost('edit-flags-changed', queryEditFlags());
	});
};
