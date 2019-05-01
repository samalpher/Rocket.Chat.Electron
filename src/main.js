import { app } from 'electron';
import jetpack from 'fs-jetpack';
import i18n from './i18n';
import './main/basicAuth';
import { processDeepLink } from './main/deepLinks';
import { mainWindow } from './main/mainWindow';
import { dock } from './main/services/dock';
import { menus } from './main/services/menus';
import { tray } from './main/services/tray';


const setupErrorHandling = () => {
	process.on('uncaughtException', (error) => {
		console.error(error && (error.stack || error));
		app.exit(1);
	});

	process.on('unhandledRejection', (reason) => {
		console.error(reason && (reason.stack || reason));
		app.exit(1);
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
	app.on('window-all-closed', () => {
		app.quit();
	});

	app.on('open-url', (event, url) => {
		event.preventDefault();
		processDeepLink(url);
	});

	app.on('second-instance', (event, argv) => {
		argv.slice(2).forEach(processDeepLink);
	});
};

const setupUI = async () => {
	await mainWindow.mount();
	await dock.mount();
	await menus.mount();
	await tray.mount();
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

	await setupUI();

	app.emit('start');
	args.forEach(processDeepLink);
})();

export { aboutDialog } from './main/services/aboutDialog';
export { dock } from './main/services/dock';
export { menus } from './main/services/menus';
export { screenshareDialog } from './main/services/screenshareDialog';
export { systemIdleTime } from './main/services/systemIdleTime';
export { tray } from './main/services/tray';
export { updateDialog } from './main/services/updateDialog';
export { updates } from './main/services/updates';
export { default as notifications } from './main/notifications';
export { default as certificate } from './main/certificateStore';
