import { app, BrowserWindow, ipcMain } from 'electron';
import { WindowStateHandler } from './state';


let state = {
	hideOnClose: false,
};

let window = null;

const setState = (partialState) => {
	state = {
		...state,
		...partialState,
	};
};

async function attachWindowStateHandling(mainWindow) {
	const windowStateHandler = new WindowStateHandler(mainWindow, 'main');
	await windowStateHandler.load();
	await new Promise((resolve) => mainWindow.once('ready-to-show', resolve));
	windowStateHandler.apply();

	const exitFullscreen = () => new Promise((resolve) => {
		if (mainWindow.isFullScreen()) {
			mainWindow.once('leave-full-screen', resolve);
			mainWindow.setFullScreen(false);
			return;
		}
		resolve();
	});

	const close = () => {
		mainWindow.blur();

		if (process.platform === 'darwin' || state.hideOnClose) {
			mainWindow.hide();
		} else if (process.platform === 'win32') {
			mainWindow.minimize();
		} else {
			app.quit();
		}
	};

	app.on('activate', () => mainWindow && mainWindow.show());
	app.on('before-quit', () => {
		mainWindow = null;
		windowStateHandler.save();
	});

	mainWindow.on('resize', () => windowStateHandler.fetchAndSave());
	mainWindow.on('move', () => windowStateHandler.fetchAndSave());
	mainWindow.on('show', () => windowStateHandler.fetchAndSave());
	mainWindow.on('close', async (event) => {
		if (!mainWindow) {
			return;
		}

		event.preventDefault();
		await exitFullscreen();
		close();
		windowStateHandler.fetchAndSave();
	});

	mainWindow.on('set-state', setState);
}

export const focus = () => {
	if (process.platform === 'win32') {
		if (window.isVisible()) {
			window.focus();
		} else if (window.isMinimized()) {
			window.restore();
		} else {
			window.show();
		}

		return;
	}

	if (window.isMinimized()) {
		window.restore();
		return;
	}

	window.show();
	window.focus();
};

ipcMain.on('focus', focus);

const mount = () => {
	window = new BrowserWindow({
		width: 1000,
		height: 600,
		minWidth: 600,
		minHeight: 400,
		titleBarStyle: 'hidden',
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	attachWindowStateHandling(window);
	window.loadFile(`${ app.getAppPath() }/app/public/app.html`);

	if (process.env.NODE_ENV === 'development') {
		window.webContents.openDevTools();
	}
};

const getBrowserWindow = () => window;

const waitForDOM = () => new Promise((resolve) => {
	if (window.webContents.isLoading()) {
		window.webContents.on('dom-ready', resolve);
		return;
	}

	resolve();
});

const send = async (channel, ...args) => {
	await waitForDOM();
	window.send(channel, ...args);
};

export const mainWindow = {
	setState,
	mount,
	getBrowserWindow,
	send,
};
