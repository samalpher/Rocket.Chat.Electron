import { app } from 'electron';
import jetpack from 'fs-jetpack';
import i18n from './i18n';
import { deepLinks } from './main/deepLinks';
import { mainWindow, createMainWindow } from './main/mainWindow';
import { certificates } from './main/certificates';
import { dock } from './main/dock';
import { menus } from './main/menus';
import { servers } from './main/servers';
import { tray } from './main/tray';
import { updates } from './main/updates';


const setupErrorHandling = () => {
	process.on('uncaughtException', (error) => {
		console.error(error && (error.stack || error));
		app.quit(1);
	});

	process.on('unhandledRejection', (reason) => {
		console.error(reason && (reason.stack || reason));
		app.quit(1);
	});
};

const setupAppParameters = () => {
	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');
	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');
	// TODO: make it a setting
	if (process.platform === 'linux') {
		app.disableHardwareAcceleration();
	}
};

const setupUserDataPath = () => {
	const appName = app.getName();
	const dirName = process.env.NODE_ENV === 'production' ? appName : `${ appName } (${ process.env.NODE_ENV })`;

	app.setPath('userData', jetpack.path(app.getPath('appData'), dirName));
};

const resetAppData = () => {
	const dataDir = app.getPath('userData');
	jetpack.remove(dataDir);
};

export const relaunch = (...args) => {
	app.relaunch({ args: [process.argv[1], ...args] });
	app.quit();
};

const attachAppEvents = () => {
	app.on('activate', () => {
		mainWindow.show();
	});

	app.on('before-quit', () => {
		mainWindow.removeAllListeners();
	});

	app.on('window-all-closed', () => {
		app.quit();
	});

	app.on('open-url', (event, url) => {
		event.preventDefault();
		deepLinks.handle(url);
	});

	app.on('second-instance', (event, argv) => {
		mainWindow.forceFocus();
		argv.slice(2).forEach(deepLinks.handle);
	});

	app.on('login', (event, webContents, { url }, authInfo, callback) => {
		event.preventDefault();
		const server = servers.fromUrl(url);
		if (server) {
			const { username, password } = server;
			callback(username, password);
		}
	});

	app.on('certificate-error', (event, webContents, requestUrl, error, certificate, callback) => {
		event.preventDefault();
		certificates.handleTrustRequest({ requestUrl, error, certificate, callback });
	});
};

(async () => {
	setupErrorHandling();
	setupAppParameters();
	setupUserDataPath();

	const args = process.argv.slice(2);

	if (args.includes('--reset-app-data')) {
		resetAppData();
		relaunch();
		return;
	}

	const canStart = process.mas || app.requestSingleInstanceLock();
	if (!canStart) {
		app.quit();
		return;
	}

	attachAppEvents();

	await app.whenReady();

	await i18n.initialize();
	await createMainWindow();
	await dock.mount();
	await menus.mount();
	await tray.mount();
	servers.initialize();
	certificates.initialize();
	updates.initialize();

	mainWindow.showIfNeeded();

	args.forEach(deepLinks.handle);
})();

export { certificates } from './main/certificates';
export { deepLinks } from './main/deepLinks';
export { dock } from './main/dock';
export { menus } from './main/menus';
export { notifications } from './main/notifications';
export { systemIdleTime } from './main/systemIdleTime';
export { servers } from './main/servers';
export { tray } from './main/tray';
export { updates } from './main/updates';
