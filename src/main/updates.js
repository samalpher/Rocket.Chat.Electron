import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { store } from '../store';
import { checkingForUpdateStarted, checkingForUpdateStopped, updateVersionSet, showUpdateModal, updateConfigurationSet, setCheckingForUpdateMessage, updateDownloadProgressed } from '../store/actions';
import { loadJson, writeJson } from '../utils';


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
	const defaultSettings = { canUpdate: true, autoUpdate: true };
	const appSettings = await loadJson('update.json', 'app');
	const userSettings = await loadJson('update.json', 'user');
	const mergedSettings = Object.assign({}, defaultSettings, appSettings, !appSettings.forced ? userSettings : undefined);

	settings = {
		...settings,
		fromAdmin: !!appSettings.forced,
		canUpdate: mergedSettings.canUpdate && isUpdatePossible,
		canAutoUpdate: mergedSettings.autoUpdate !== false,
		canSetAutoUpdate: !appSettings.forced || appSettings.autoUpdate !== false,
		skippedVersion: mergedSettings.skip,
	};
	store.dispatch(updateConfigurationSet(settings));
};

const updateSettings = async (newSettings) => {
	if (settings.fromAdmin) {
		return;
	}

	settings = {
		...settings,
		...newSettings,
	};
	store.dispatch(updateConfigurationSet(settings));

	const data = {
		canUpdate: settings.canUpdate,
		autoUpdate: settings.canAutoUpdate,
		...(settings.skippedVersion ? {
			skip: settings.skippedVersion,
		} : {}),
	};

	await writeJson('update.json', data);
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
	app.removeAllListeners();
	autoUpdater.quitAndInstall();
};

const handleError = () => {
	isCheckingForUpdate = false;
	store.dispatch(setCheckingForUpdateMessage(i18n.__('dialog.about.errorWhileLookingForUpdates')));
	setTimeout(() => store.dispatch(checkingForUpdateStopped()), 5000);
};

const handleCheckingForUpdate = () => {
	store.dispatch(checkingForUpdateStarted());
};

const handleUpdateAvailable = (info) => {
	isCheckingForUpdate = false;

	const { skippedVersion } = settings;
	const { version } = info;
	const shouldSkip = skippedVersion === version;

	if (!isForcedChecking && shouldSkip) {
		store.dispatch(setCheckingForUpdateMessage(i18n.__('dialog.about.noUpdatesAvailable')));
		setTimeout(() => store.dispatch(checkingForUpdateStopped()), 5000);
	} else {
		store.dispatch(checkingForUpdateStopped());
		store.dispatch(updateVersionSet(version));
		store.dispatch(showUpdateModal());
	}
};

const handleUpdateNotAvailable = () => {
	isCheckingForUpdate = false;

	store.dispatch(setCheckingForUpdateMessage(i18n.__('dialog.about.noUpdatesAvailable')));
	setTimeout(() => store.dispatch(checkingForUpdateStopped()), 5000);
};

const handleDownloadProgress = (progress) => {
	store.dispatch(updateDownloadProgressed(progress));
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
