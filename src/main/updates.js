import debug from 'debug';
import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { sagaMiddleware } from '../store';
import {
	CHECK_FOR_UPDATE,
	DOWNLOAD_UPDATE,
	LOAD_CONFIG,
	QUIT_AND_INSTALL_UPDATE,
	SET_AUTO_UPDATE,
	SKIP_UPDATE,
	UPDATE_CONFIGURATION_LOADED,
	autoUpdateSet,
	checkingForAutoUpdateStarted,
	checkingForUpdateErrored,
	checkingForUpdateStarted,
	destroyMainWindow,
	updateAvailable,
	updateConfigurationLoaded,
	updateDownloadProgressed,
	updateDownloadCompleted,
	updateDownloadErrored,
	updateNotAvailable,
	updateSkipped,
} from '../store/actions';
import { loadJson, purgeFile } from '../utils';


const doLoadConfig = function *({ payload: { update } }) {
	debug('rc:data')('update.json');
	const appUpdateConfiguration = yield call(loadJson, 'update.json', 'app');
	const userUpdateConfiguration = yield call(loadJson, 'update.json', 'user');

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
	yield call(purgeFile, 'update.json', 'user');

	yield put(updateConfigurationLoaded(update));
};

const didUpdateConfigurationLoad = function *({ payload: { canUpdate, canAutoUpdate } }) {
	if (canUpdate && canAutoUpdate) {
		yield put(checkingForAutoUpdateStarted());
		try {
			yield call(() => autoUpdater.checkForUpdates());
		} catch (error) {
			yield put(checkingForUpdateErrored(error));
		}
	}
};

const doSetAutoUpdate = function *(enabled) {
	const { update: { configuration: { canSetAutoUpdate } } } = yield select();
	if (!canSetAutoUpdate) {
		return;
	}

	yield put(autoUpdateSet(enabled));
};

const doCheckForUpdate = function *() {
	const { update: { configuration: { canUpdate }, checking } } = yield select();

	if (checking || !canUpdate) {
		return;
	}

	yield put(checkingForUpdateStarted());
	try {
		yield call(() => autoUpdater.checkForUpdates());
	} catch (error) {
		yield put(checkingForUpdateErrored(error));
	}
};

const doSkipUpdate = function *() {
	const { update: { configuration: { fromAdmin }, version } } = yield select();

	if (fromAdmin) {
		return;
	}

	yield put(updateSkipped(version));
};

const doDownloadUpdate = function *() {
	try {
		yield call(() => autoUpdater.downloadUpdate());
	} catch (error) {
		yield updateDownloadErrored(error);
	}
};

const doQuitAndInstallUpdate = function *() {
	yield put(destroyMainWindow());
	app.removeAllListeners();
	autoUpdater.quitAndInstall();
};

const handleUpdateAvailable = ({ version }) => sagaMiddleware.run(function *handleUpdateAvailable() {
	const {
		update: {
			configuration: { skippedVersion },
			checking: { mode } = {},
		},
	} = yield select();

	const isAutoUpdate = mode === 'auto';
	const shouldSkip = skippedVersion === version;

	if (isAutoUpdate && shouldSkip) {
		yield put(updateNotAvailable());
		return;
	}

	yield put(updateAvailable(version));
});

const handleUpdateNotAvailable = () => sagaMiddleware.run(function *handleUpdateNotAvailable() {
	yield put(updateNotAvailable());
});

const handleDownloadProgress = (progress) => sagaMiddleware.run(function *handleDownloadProgress() {
	yield put(updateDownloadProgressed(progress));
});

const handleUpdateDownloaded = (info) => sagaMiddleware.run(function *handleUpdateDownloaded() {
	yield put(updateDownloadCompleted(info));
});

autoUpdater.autoDownload = false;
autoUpdater.logger = null;
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);

sagaMiddleware.run(function *watchUpdateActions() {
	yield takeEvery(LOAD_CONFIG, doLoadConfig);
	yield takeEvery(UPDATE_CONFIGURATION_LOADED, didUpdateConfigurationLoad);
	yield takeEvery(SET_AUTO_UPDATE, doSetAutoUpdate);
	yield takeEvery(CHECK_FOR_UPDATE, doCheckForUpdate);
	yield takeEvery(SKIP_UPDATE, doSkipUpdate);
	yield takeEvery(DOWNLOAD_UPDATE, doDownloadUpdate);
	yield takeEvery(QUIT_AND_INSTALL_UPDATE, doQuitAndInstallUpdate);
});
