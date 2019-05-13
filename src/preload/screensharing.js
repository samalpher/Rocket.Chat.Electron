import { ipcRenderer } from 'electron';
import { requestScreenshareSource, selectScreenshareSource } from './channels';


export default () => {
	ipcRenderer.on(selectScreenshareSource, (event, sourceId) => {
		window.parent.postMessage({ sourceId }, '*');
	});

	window.addEventListener('get-sourceId', (event) => ipcRenderer.sendToHost(requestScreenshareSource, event.detail));
};
