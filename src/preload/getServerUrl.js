import { ipcRenderer } from 'electron';


let serverUrl;

export const getServerUrl = () => new Promise((resolve) => {
	serverUrl && resolve(serverUrl);

	ipcRenderer.once('set-server-url', (event, url) => {
		serverUrl = url;
		resolve(url);
	});
});
