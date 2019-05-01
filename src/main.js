import { app } from 'electron';
import appData from './main/appData';
import './main/basicAuth';
import { processDeepLink } from './main/deepLinks';
import './main/updates';
import { getMainWindow } from './main/mainWindow';
import i18n from './i18n';
export { aboutDialog } from './main/services/aboutDialog';
export { dock } from './main/services/dock';
export { menus } from './main/services/menus';
export { screenshareDialog } from './main/services/screenshareDialog';
export { systemIdleTime } from './main/services/systemIdleTime';
export { tray } from './main/services/tray';
export { updateDialog } from './main/services/updateDialog';
export { default as notifications } from './main/notifications';
export { default as certificate } from './main/certificateStore';


function handleUncaughtException(error) {
	console.error(error);
	app.exit(1);
}

function handleUnhandledRejection(reason) {
	console.error(reason);
	app.exit(1);
}

async function prepareApp() {
	process.on('uncaughtException', handleUncaughtException);
	process.on('unhandledRejection', handleUnhandledRejection);

	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');

	await appData.initialize();

	const canStart = process.mas || app.requestSingleInstanceLock();

	if (!canStart) {
		app.quit();
		return;
	}

	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

	// TODO: make it a setting
	if (process.platform === 'linux') {
		app.disableHardwareAcceleration();
	}

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
}

(async () => {
	await prepareApp();
	await app.whenReady();
	await i18n.initialize();
	app.emit('start');
	await getMainWindow();
	process.argv.slice(2).forEach(processDeepLink);
})();
