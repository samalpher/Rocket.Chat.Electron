import { app, BrowserWindow } from 'electron';
import { mainWindow } from '../mainWindow';
import i18n from '../../i18n';


let window;

const open = () => {
	if (window) {
		return;
	}

	window = new BrowserWindow({
		width: 776,
		height: 600,
		useContentSize: true,
		center: true,
		resizable: false,
		minimizable: false,
		maximizable: false,
		fullscreen: false,
		fullscreenable: false,
		skipTaskbar: true,
		title: i18n.__('dialog.screenshare.title'),
		show: false,
		parent: mainWindow.getBrowserWindow(),
		modal: process.platform !== 'darwin',
		backgroundColor: '#F4F4F4',
		type: process.platform === 'darwin' ? 'desktop' : 'toolbar',
		webPreferences: {
			devTools: false,
			nodeIntegration: true,
		},
	});
	window.setMenuBarVisibility(false);

	window.once('ready-to-show', () => {
		window.show();
	});

	window.once('closed', () => {
		if (!window.resultSent) {
			mainWindow.getBrowserWindow().webContents.send('screenshare-result', 'PermissionDeniedError');
		}
		window = null;
	});

	window.loadFile(`${ app.getAppPath() }/app/public/dialogs/screenshare.html`);
};

const close = () => {
	if (!window) {
		return;
	}

	window.destroy();
};

const selectSource = (id) => {
	mainWindow.getBrowserWindow().webContents.send('screenshare-result', id);
	if (window) {
		window.resultSent = true;
		close();
	}
};

export const screenshareDialog = {
	open,
	close,
	selectSource,
};
