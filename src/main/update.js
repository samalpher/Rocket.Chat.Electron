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
} from '../actions';


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
	const { preferences: { canSetAutoUpdate } } = yield select();
	if (!canSetAutoUpdate) {
		return;
	}

	yield put(autoUpdateSet(enabled));
};

const doCheckForUpdate = function* () {
	const { preferences: { canUpdate }, checking } = yield select();

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
	const { update: { adminConfiguration, version } } = yield select();

	if (adminConfiguration) {
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
		preferences: { skippedVersion },
		update: {
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

export const setupUpdate = ({ getState, dispatch, runSaga }) => {
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
};
