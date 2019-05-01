import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import jetpack from 'fs-jetpack';
import i18n from '../../i18n';
import { mainWindow } from '../mainWindow';
import { aboutDialog } from './aboutDialog';
import { updateDialog } from './updateDialog';


const events = new EventEmitter();

const appDir = jetpack.cwd(app.getAppPath(), app.getAppPath().endsWith('app.asar') ? '..' : '.');
const userDataDir = jetpack.cwd(app.getPath('userData'));
const updateSettingsFileName = 'update.json';

const loadUpdateSettings = (dir) => {
	try {
		return dir.read(updateSettingsFileName, 'json') || {};
	} catch (error) {
		console.error(error);
		return {};
	}
};

const appUpdateSettings = loadUpdateSettings(appDir);
const userUpdateSettings = loadUpdateSettings(userDataDir);
const updateSettings = (() => {
	const defaultUpdateSettings = { autoUpdate: true, canUpdate: true };

	if (appUpdateSettings.forced) {
		return Object.assign({}, defaultUpdateSettings, appUpdateSettings);
	} else {
		return Object.assign({}, defaultUpdateSettings, appUpdateSettings, userUpdateSettings);
	}
})();
delete updateSettings.forced;

const saveUpdateSettings = () => {
	if (appUpdateSettings.forced) {
		return;
	}

	userDataDir.write(updateSettingsFileName, userUpdateSettings, { atomic: true });
};

const canUpdate = () => updateSettings.canUpdate &&
	(
		(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
		(process.platform === 'win32' && !process.windowsStore) ||
		(process.platform === 'darwin' && !process.mas)
	);

const canAutoUpdate = () => updateSettings.autoUpdate !== false;

const canSetAutoUpdate = () => !appUpdateSettings.forced || appUpdateSettings.autoUpdate !== false;

const setAutoUpdate = (canAutoUpdate) => {
	if (!canSetAutoUpdate()) {
		return;
	}

	updateSettings.autoUpdate = userUpdateSettings.autoUpdate = Boolean(canAutoUpdate);
	saveUpdateSettings();
};

const skipUpdateVersion = (version) => {
	userUpdateSettings.skip = version;
	saveUpdateSettings();
};

const downloadUpdate = async () => {
	try {
		await autoUpdater.downloadUpdate();
	} catch (e) {
		autoUpdater.emit('error', e);
	}
};

let checkForUpdatesEvent = null;

const checkForUpdates = async (event = null, { forced = false } = {}) => {
	if (checkForUpdatesEvent) {
		return;
	}

	if ((forced || canAutoUpdate()) && canUpdate()) {
		checkForUpdatesEvent = event;
		try {
			await autoUpdater.checkForUpdates();
		} catch (e) {
			autoUpdater.emit('error', e);
		}
	}
};

const handleCheckingForUpdate = () => {
	events.emit('checking-for-update');
	mainWindow.send('update-checking');
};

const handleUpdateAvailable = ({ version }) => {
	events.emit('update-available', { version });
	if (checkForUpdatesEvent) {
		checkForUpdatesEvent.sender.send('update-result', true);
		checkForUpdatesEvent = null;
	} else if (updateSettings.skip === version) {
		return;
	}

	aboutDialog.close();
	updateDialog.open({ newVersion: version });
};

const handleUpdateNotAvailable = () => {
	events.emit('update-not-available');
	mainWindow.send('update-not-available');

	if (checkForUpdatesEvent) {
		checkForUpdatesEvent.sender.send('update-result', false);
		checkForUpdatesEvent = null;
	}
};

const handleDownloadProgress = (progress, bytesPerSecond, percent, total, transferred) => {
	events.emit('download-progress', { progress, bytesPerSecond, percent, total, transferred });
};

const handleUpdateDownloaded = async (info) => {
	events.emit('update-downloaded', info);
	const window = mainWindow.getBrowserWindow();

	const response = dialog.showMessageBox(window, {
		type: 'question',
		title: i18n.__('dialog.updateReady.title'),
		message: i18n.__('dialog.updateReady.message'),
		buttons: [
			i18n.__('dialog.updateReady.installLater'),
			i18n.__('dialog.updateReady.installNow'),
		],
		defaultId: 1,
	});

	if (response === 0) {
		dialog.showMessageBox(window, {
			type: 'info',
			title: i18n.__('dialog.updateInstallLater.title'),
			message: i18n.__('dialog.updateInstallLater.message'),
			buttons: [i18n.__('dialog.updateInstallLater.ok')],
			defaultId: 0,
		});
		return;
	}

	window.removeAllListeners();
	app.removeAllListeners('window-all-closed');
	try {
		autoUpdater.quitAndInstall();
	} catch (e) {
		autoUpdater.emit('error', e);
	}
};

const handleError = async (error) => {
	events.emit('error', error);
	mainWindow.send('update-error', error);

	if (checkForUpdatesEvent) {
		checkForUpdatesEvent.sender.send('update-result', false);
		checkForUpdatesEvent = null;
	}
};

autoUpdater.autoDownload = false;
autoUpdater.on('checking-for-update', handleCheckingForUpdate);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);
autoUpdater.on('error', handleError);

export const updates = Object.assign(events, {
	canUpdate,
	canAutoUpdate,
	canSetAutoUpdate,
	setAutoUpdate,
	checkForUpdates,
	skipUpdateVersion,
	downloadUpdate,
});
