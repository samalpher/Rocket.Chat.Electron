import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { call, put, select, takeEvery } from 'redux-saga/effects';
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
} from '../actions';
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

const handleUpdateAvailable = (getState, dispatch) => ({ version }) => {
	const {
		update: {
			configuration: { skippedVersion },
			checking: { mode } = {},
		},
	} = getState();

	const isAutoUpdate = mode === 'auto';
	const shouldSkip = skippedVersion === version;

	if (isAutoUpdate && shouldSkip) {
		dispatch(updateNotAvailable());
		return;
	}

	dispatch(updateAvailable(version));
};

const handleUpdateNotAvailable = (dispatch) => () => {
	dispatch(updateNotAvailable());
};

const handleDownloadProgress = (dispatch) => (progress) => {
	dispatch(updateDownloadProgressed(progress));
};

const handleUpdateDownloaded = (dispatch) => (info) => {
	dispatch(updateDownloadCompleted(info));
};

const selectToUserData = ({
	update: {
		configuration: {
			canUpdate,
			canAutoUpdate,
			skippedVersion,
		} = {},
	} = {},
}) => ({
	update: {
		canUpdate,
		canAutoUpdate,
		skippedVersion,
	},
});

const fetchFromUserData = (dispatch) => async ({ canUpdate, canAutoUpdate, skippedVersion }) => {
	const appUpdateConfiguration = await loadJson('app', 'update.json');
	const userUpdateConfiguration = await loadJson('user', 'update.json');

	const fromAdmin = !!appUpdateConfiguration.forced;

	const isUpdatePossible = (
		(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
		(process.platform === 'win32' && !process.windowsStore) ||
		(process.platform === 'darwin' && !process.mas)
	);

	const updateConfiguration = {
		fromAdmin,
		canUpdate: isUpdatePossible && (
			fromAdmin ?
				(appUpdateConfiguration.canUpdate !== false || true) :
				(userUpdateConfiguration.canUpdate !== false || canUpdate || true)
		),
		canAutoUpdate: (
			fromAdmin ?
				(appUpdateConfiguration.autoUpdate !== false || true) :
				(userUpdateConfiguration.autoUpdate !== false || canAutoUpdate || true)
		),
		canSetAutoUpdate: !appUpdateConfiguration.forced || appUpdateConfiguration.autoUpdate !== false,
		skippedVersion: (
			fromAdmin ?
				(appUpdateConfiguration.skip || null) :
				(userUpdateConfiguration.skip || skippedVersion || null)
		),
	};

	await purgeFile('user', 'update.json');

	dispatch(updateConfigurationLoaded(updateConfiguration));
};

export const useUpdate = ({ getState, dispatch, runSaga }) => {
	autoUpdater.autoDownload = false;
	autoUpdater.logger = null;
	autoUpdater.on('update-available', handleUpdateAvailable(getState, dispatch));
	autoUpdater.on('update-not-available', handleUpdateNotAvailable(dispatch));
	autoUpdater.on('download-progress', handleDownloadProgress(dispatch));
	autoUpdater.on('update-downloaded', handleUpdateDownloaded(dispatch));

	runSaga(function* watchUpdateActions() {
		yield takeEvery(UPDATE_CONFIGURATION_LOADED, didUpdateConfigurationLoad);
		yield takeEvery(SET_AUTO_UPDATE, doSetAutoUpdate);
		yield takeEvery(CHECK_FOR_UPDATE, doCheckForUpdate);
		yield takeEvery(SKIP_UPDATE, doSkipUpdate);
		yield takeEvery(DOWNLOAD_UPDATE, doDownloadUpdate);
		yield takeEvery(QUIT_AND_INSTALL_UPDATE, doQuitAndInstallUpdate);
	});

	connectUserData(selectToUserData, fetchFromUserData(dispatch));
};
