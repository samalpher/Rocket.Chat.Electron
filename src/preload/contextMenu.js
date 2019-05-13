import { ipcRenderer, remote } from 'electron';
import { triggerContextMenu } from './channels';
const { getCurrentWebContents } = remote;


export default () => {
	getCurrentWebContents().on('context-menu', (event, params) => {
		event.preventDefault();
		ipcRenderer.sendToHost(triggerContextMenu, params);
	});
};
