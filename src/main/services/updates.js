import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import jetpack from 'fs-jetpack';


let settings = {
	fromAdmin: true,
	canUpdate: false,
	canAutoUpdate: false,
	canSetAutoUpdate: false,
	skippedVersion: null,
};
const events = new EventEmitter();

const isUpdatePossible = (
	(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
	(process.platform === 'win32' && !process.windowsStore) ||
	(process.platform === 'darwin' && !process.mas)
);

const loadSettings = async () => {
	const appDir = jetpack.cwd(app.getAppPath(), app.getAppPath().endsWith('app.asar') ? '..' : '.');
	const userDataDir = jetpack.cwd(app.getPath('userData'));

	const defaultSettings = { canUpdate: true, autoUpdate: true };
	const appSettings = await appDir.readAsync('update.json', 'json')
		.then((json) => (typeof json === 'object' ? json : {}), () => ({}));
	const userSettings = await userDataDir.readAsync('update.json', 'json')
		.then((json) => (typeof json === 'object' ? json : {}), () => ({}));
	const mergedSettings = Object.assign({}, defaultSettings, appSettings, !appSettings.forced ? userSettings : undefined);

	settings = {
		...settings,
		fromAdmin: !!appSettings.forced,
		canUpdate: mergedSettings.canUpdate && isUpdatePossible,
		canAutoUpdate: mergedSettings.autoUpdate !== false,
		canSetAutoUpdate: !appSettings.forced || appSettings.autoUpdate !== false,
		skippedVersion: mergedSettings.skip,
	};
	events.emit('configuration-set', settings);
};

const updateSettings = async (newSettings) => {
	if (settings.fromAdmin) {
		return;
	}

	settings = {
		...settings,
		...newSettings,
	};
	events.emit('configuration-set', settings);

	const data = {
		canUpdate: settings.canUpdate,
		autoUpdate: settings.canAutoUpdate,
		...(settings.skippedVersion ? {
			skip: settings.skippedVersion,
		} : {}),
	};

	const userDataDir = jetpack.cwd(app.getPath('userData'));
	await userDataDir.writeAsync('update.json', data, { atomic: true });
};

const setAutoUpdate = async (canAutoUpdate) => {
	if (!settings.canSetAutoUpdate) {
		return;
	}

	await updateSettings({ canAutoUpdate: !!canAutoUpdate });
};

const skipVersion = async (version) => {
	await updateSettings({ skippedVersion: version });
};

let isCheckingForUpdate = false;
let isForcedChecking = false;

const checkForUpdatesIfAllowed = async () => {
	if (isCheckingForUpdate) {
		return;
	}

	const { canUpdate, canAutoUpdate } = settings;

	if (canUpdate && canAutoUpdate) {
		isCheckingForUpdate = true;
		isForcedChecking = false;
		await autoUpdater.checkForUpdates();
	}
};

const checkForUpdates = async () => {
	if (isCheckingForUpdate) {
		return;
	}

	const { canUpdate } = settings;

	if (canUpdate) {
		isCheckingForUpdate = true;
		isForcedChecking = true;
		await autoUpdater.checkForUpdates();
	}
};

const downloadUpdate = async () => {
	await autoUpdater.downloadUpdate();
};

const quitAndInstall = () => {
	app.removeAllListeners('window-all-closed');
	autoUpdater.quitAndInstall();
};

const handleError = (error) => {
	isCheckingForUpdate = false;
	events.emit('error', error);
};

const handleCheckingForUpdate = () => {
	events.emit('checking-for-update');
};

const handleUpdateAvailable = (info) => {
	isCheckingForUpdate = false;

	const { skippedVersion } = settings;
	const { version } = info;
	const shouldSkip = skippedVersion === version;

	if (!isForcedChecking && shouldSkip) {
		events.emit('update-not-available');
	} else {
		events.emit('update-available', info);
	}
};

const handleUpdateNotAvailable = () => {
	isCheckingForUpdate = false;

	events.emit('update-not-available');
};

const handleDownloadProgress = (progress) => {
	events.emit('download-progress', progress);
};

const handleUpdateDownloaded = (info) => {
	events.emit('update-downloaded', info);
};

autoUpdater.autoDownload = false;
autoUpdater.logger = null;
autoUpdater.on('error', handleError);
autoUpdater.on('checking-for-update', handleCheckingForUpdate);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);

const initialize = async () => {
	await loadSettings();
	await checkForUpdatesIfAllowed();
};

export const updates = Object.assign(events, {
	initialize,
	setAutoUpdate,
	checkForUpdates,
	skipVersion,
	downloadUpdate,
	quitAndInstall,
});
