import debug from 'debug';
import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { put, select, takeEvery } from 'redux-saga/effects';
import { store, sagaMiddleware } from '../store';
import {
	CONFIG_LOADING,
	UPDATE_CONFIGURATION_LOADED,
	SET_AUTO_UPDATE,
	CHECK_FOR_UPDATE,
	SKIP_UPDATE,
	DOWNLOAD_UPDATE,
	QUIT_AND_INSTALL_UPDATE,
	updateConfigurationLoaded as updateConfigurationLoadedAction,
	autoUpdateSet,
	checkingForAutoUpdateStarted,
	checkingForUpdateStarted,
	checkingForUpdateErrored,
	updateNotAvailable,
	updateAvailable,
	updateSkipped,
	updateDownloadProgressed,
	updateDownloadCompleted,
	updateDownloadErrored,
	destroyWindow,
} from '../store/actions';
import { loadJson, purgeFile } from '../utils';


const loadUpdateConfiguration = function *({ payload: { update } }) {
	debug('rc:data')('update.json');
	const appUpdateConfiguration = yield loadJson('update.json', 'app');
	const userUpdateConfiguration = yield loadJson('update.json', 'user');

	const fromAdmin = !!appUpdateConfiguration.forced;

	const isUpdatePossible = (
		(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
		(process.platform === 'win32' && !process.windowsStore) ||
		(process.platform === 'darwin' && !process.mas)
	);

	update = {
		...update,
		fromAdmin,
		canUpdate: isUpdatePossible && (
			fromAdmin ?
				(appUpdateConfiguration.canUpdate !== false || true) :
				(userUpdateConfiguration.canUpdate !== false || update.canUpdate || true)
		),
		canAutoUpdate: (
			fromAdmin ?
				(appUpdateConfiguration.autoUpdate !== false || true) :
				(userUpdateConfiguration.autoUpdate !== false || update.canAutoUpdate || true)
		),
		canSetAutoUpdate: !appUpdateConfiguration.forced || appUpdateConfiguration.autoUpdate !== false,
		skippedVersion: (
			fromAdmin ?
				(appUpdateConfiguration.skip || null) :
				(userUpdateConfiguration.skip || update.skippedVersion || null)
		),
	};
	yield purgeFile('update.json', 'user');

	yield put(updateConfigurationLoadedAction(update));
};

const updateConfigurationLoaded = function *({ payload: { canUpdate, canAutoUpdate } }) {
	if (canUpdate && canAutoUpdate) {
		yield put(checkingForAutoUpdateStarted());
		try {
			yield autoUpdater.checkForUpdates();
		} catch (error) {
			yield put(checkingForUpdateErrored(error));
		}
	}
};

const setAutoUpdate = function *(enabled) {
	const { update: { configuration: { canSetAutoUpdate } } } = yield select();
	if (!canSetAutoUpdate) {
		return;
	}

	yield put(autoUpdateSet(enabled));
};

const checkForUpdate = function *() {
	const { update: { configuration: { canUpdate }, checking } } = yield select();

	if (checking || !canUpdate) {
		return;
	}

	yield put(checkingForUpdateStarted());
	try {
		yield autoUpdater.checkForUpdates();
	} catch (error) {
		yield put(checkingForUpdateErrored(error));
	}
};

const skipUpdate = function *() {
	const { update: { configuration: { fromAdmin }, version } } = yield select();
	if (fromAdmin) {
		return;
	}

	yield put(updateSkipped(version));
};

const downloadUpdate = function *() {
	try {
		yield autoUpdater.downloadUpdate();
	} catch (error) {
		yield updateDownloadErrored(error);
	}
};

const quitAndInstallUpdate = function *() {
	yield put(destroyWindow());
	app.removeAllListeners();
	autoUpdater.quitAndInstall();
};

const handleUpdateAvailable = ({ version }) => {
	const {
		update: {
			configuration: { skippedVersion },
			checking: { mode } = {},
		},
	} = store.getState();
	const isAutoUpdate = mode === 'auto';
	const shouldSkip = skippedVersion === version;

	if (isAutoUpdate && shouldSkip) {
		store.dispatch(updateNotAvailable());
		return;
	}

	store.dispatch(updateAvailable(version));
};

const handleUpdateNotAvailable = () => {
	store.dispatch(updateNotAvailable());
};

const handleDownloadProgress = (progress) => {
	store.dispatch(updateDownloadProgressed(progress));
};

const handleUpdateDownloaded = (info) => {
	store.dispatch(updateDownloadCompleted(info));
};

autoUpdater.autoDownload = false;
autoUpdater.logger = null;
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);

sagaMiddleware.run(function *updatesSaga() {
	yield takeEvery(CONFIG_LOADING, loadUpdateConfiguration);
	yield takeEvery(UPDATE_CONFIGURATION_LOADED, updateConfigurationLoaded);
	yield takeEvery(SET_AUTO_UPDATE, setAutoUpdate);
	yield takeEvery(CHECK_FOR_UPDATE, checkForUpdate);
	yield takeEvery(SKIP_UPDATE, skipUpdate);
	yield takeEvery(DOWNLOAD_UPDATE, downloadUpdate);
	yield takeEvery(QUIT_AND_INSTALL_UPDATE, quitAndInstallUpdate);
});
