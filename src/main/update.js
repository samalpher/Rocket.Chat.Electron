import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { getStore, getSaga } from './store';
import {
	CHECK_FOR_UPDATE,
	DOWNLOAD_UPDATE,
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
	updateDownloadProgressed,
	updateDownloadCompleted,
	updateDownloadErrored,
	updateNotAvailable,
	updateSkipped,
	updateConfigurationLoaded,
} from '../store/actions';
import { loadJson, purgeFile } from './userData/fileSystem';
import { connectUserData } from './userData/store';


const didUpdateConfigurationLoad = function* ({ payload: { canUpdate, canAutoUpdate } }) {
	if (canUpdate && canAutoUpdate) {
		yield put(checkingForAutoUpdateStarted());
		try {
			yield call(() => autoUpdater.checkForUpdates());
		} catch (error) {
			yield put(checkingForUpdateErrored(error));
		}
	}
};

const doSetAutoUpdate = function* ({ payload: enabled }) {
	const { update: { configuration: { canSetAutoUpdate } } } = yield select();
	if (!canSetAutoUpdate) {
		return;
	}

	yield put(autoUpdateSet(enabled));
};

const doCheckForUpdate = function* () {
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

const doSkipUpdate = function* () {
	const { update: { configuration: { fromAdmin }, version } } = yield select();

	if (fromAdmin) {
		return;
	}

	yield put(updateSkipped(version));
};

const doDownloadUpdate = function* () {
	try {
		yield call(() => autoUpdater.downloadUpdate());
	} catch (error) {
		yield updateDownloadErrored(error);
	}
};

const doQuitAndInstallUpdate = function* () {
	yield put(destroyMainWindow());
	app.removeAllListeners();
	autoUpdater.quitAndInstall();
};

const handleUpdateAvailable = async ({ version }) => (await getSaga()).run(function* handleUpdateAvailable() {
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

const handleUpdateNotAvailable = async () => (await getSaga()).run(function* handleUpdateNotAvailable() {
	yield put(updateNotAvailable());
});

const handleDownloadProgress = async (progress) => (await getSaga()).run(function* handleDownloadProgress() {
	yield put(updateDownloadProgressed(progress));
});

const handleUpdateDownloaded = async (info) => (await getSaga()).run(function* handleUpdateDownloaded() {
	yield put(updateDownloadCompleted(info));
});

autoUpdater.autoDownload = false;
autoUpdater.logger = null;
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);

const selectToUserData = ({
	update: {
		configuration: update = {},
	} = {},
}) => ({ update });

const fetchFromUserData = async (updateConfiguration) => {
	const appUpdateConfiguration = await loadJson('app', 'update.json');
	const userUpdateConfiguration = await loadJson('user', 'update.json');

	const fromAdmin = !!appUpdateConfiguration.forced;

	const isUpdatePossible = (
		(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
		(process.platform === 'win32' && !process.windowsStore) ||
		(process.platform === 'darwin' && !process.mas)
	);

	updateConfiguration = {
		...updateConfiguration,
		fromAdmin,
		canUpdate: isUpdatePossible && (
			fromAdmin ?
				(appUpdateConfiguration.canUpdate !== false || true) :
				(userUpdateConfiguration.canUpdate !== false || updateConfiguration.canUpdate || true)
		),
		canAutoUpdate: (
			fromAdmin ?
				(appUpdateConfiguration.autoUpdate !== false || true) :
				(userUpdateConfiguration.autoUpdate !== false || updateConfiguration.canAutoUpdate || true)
		),
		canSetAutoUpdate: !appUpdateConfiguration.forced || appUpdateConfiguration.autoUpdate !== false,
		skippedVersion: (
			fromAdmin ?
				(appUpdateConfiguration.skip || null) :
				(userUpdateConfiguration.skip || updateConfiguration.skippedVersion || null)
		),
	};
	await purgeFile('user', 'update.json');

	(await getStore()).dispatch(updateConfigurationLoaded(updateConfiguration));
};

const attachToStore = () => connectUserData(selectToUserData, fetchFromUserData);

export const useUpdate = async () => {
	(await getSaga()).run(function* watchUpdateActions() {
		yield takeEvery(UPDATE_CONFIGURATION_LOADED, didUpdateConfigurationLoad);
		yield takeEvery(SET_AUTO_UPDATE, doSetAutoUpdate);
		yield takeEvery(CHECK_FOR_UPDATE, doCheckForUpdate);
		yield takeEvery(SKIP_UPDATE, doSkipUpdate);
		yield takeEvery(DOWNLOAD_UPDATE, doDownloadUpdate);
		yield takeEvery(QUIT_AND_INSTALL_UPDATE, doQuitAndInstallUpdate);
	});

	attachToStore();
};
