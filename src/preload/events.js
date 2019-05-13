import { ipcRenderer } from 'electron';
import { queryEditFlags } from '../utils';
import { editFlagsChanged, badgeChanged } from './channels';


export default () => {
	document.addEventListener('dragover', (event) => event.preventDefault());
	document.addEventListener('drop', (event) => event.preventDefault());

	window.addEventListener('unread-changed', (event) => {
		ipcRenderer.sendToHost(badgeChanged, event.detail);
	});

	document.addEventListener('selectionchange', () => {
		ipcRenderer.sendToHost(editFlagsChanged, queryEditFlags());
	});
};
