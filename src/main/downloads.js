import { app, session } from 'electron';
import jetpack from 'fs-jetpack';
import { take } from 'redux-saga/effects';
import uniqid from 'uniqid';
import {
	ALL_DOWNLOADS_CLEARED,
	DOWNLOAD_CLEARED,
	downloadStarted,
	downloadUpdated,
	downloadsLoaded,
} from '../actions';
import { downloads as debug } from '../debug';
import { connectUserData } from './userData/store';


const createDownloadItem = (id, item) => ({
	id,
	bytesPerSecond: item.getReceivedBytes() / (Date.now() / 1e3 - item.getStartTime()),
	percent: item.getReceivedBytes() / item.getTotalBytes(),
	total: item.getTotalBytes(),
	transferred: item.getReceivedBytes(),
	state: item.getState(),
	paused: item.isPaused(),
	canResume: item.canResume(),
	fileName: item.getFilename(),
	filePath: item.getSavePath(),
	fileType: item.getMimeType(),
	fileState: item.getState(),
	creationDate: item.getStartTime(),
});

const createWillDownloadHandler = (dispatch, runSaga) => (event, item) => {
	const id = uniqid();

	// TODO: fix download file overwrite
	item.setSavePath(jetpack.path(app.getPath('downloads'), item.getFilename()));

	item.on('updated', () => {
		dispatch(downloadUpdated(createDownloadItem(id, item)));
	});

	item.once('done', () => {
		if (item.getState() === 'cancelled') {
			return;
		}
		dispatch(downloadUpdated(createDownloadItem(id, item)));
	});

	runSaga(function* handleClearDownload() {
		for (;;) {
			const { payload: _id } = yield take(DOWNLOAD_CLEARED);
			if (id !== _id || item.isDestroyed()) {
				continue;
			}

			if (item.getState() === 'progressing') {
				item.cancel();
			}
			break;
		}
	});

	runSaga(function* handleClearAllDownloads() {
		for (;;) {
			yield take(ALL_DOWNLOADS_CLEARED);

			if (item.isDestroyed()) {
				continue;
			}

			if (item.getState() === 'progressing') {
				item.cancel();
			}
			break;
		}
	});

	debug('downloading %o to %o', item.getURL(), item.getSavePath());
	dispatch(downloadStarted(createDownloadItem(id, item)));
};

const selectToUserData = ({ downloads = [] }) => ({ downloads });

const fetchFromUserData = (dispatch) => (downloads) => {
	dispatch(downloadsLoaded(downloads));
};

export const useDownloads = async ({ dispatch, runSaga }) => {
	connectUserData(selectToUserData, fetchFromUserData(dispatch));

	await app.whenReady();

	const handleWillDownload = createWillDownloadHandler(dispatch, runSaga);
	session.defaultSession.on('will-download', handleWillDownload);
	debug('%o event listener attached', 'will-download');
};
