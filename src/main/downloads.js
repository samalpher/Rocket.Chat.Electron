import { app, session } from 'electron';
import jetpack from 'fs-jetpack';
import { put, takeEvery } from 'redux-saga/effects';
import uniqid from 'uniqid';
import { getStore, getSaga } from './store';
import {
	APP_READY,
	CLEAR_ALL_DOWNLOADS,
	CLEAR_DOWNLOAD,
	allDownloadsCleared,
	downloadCleared,
	downloadStarted,
	downloadUpdated,
	downloadsLoaded,
} from '../actions';
import { downloads as debug } from '../debug';
import { connectUserData } from './userData/store';
import { waitForAction } from '../utils/store';


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

const items = new Map();

const handleWillDownload = async (event, item) => {
	const id = uniqid();

	const handleDownloadUpdated = async () => {
		(await getStore()).dispatch(downloadUpdated(createDownloadItem(id, item)));
	};

	const handleDownloadDone = async () => {
		(await getStore()).dispatch(downloadUpdated(createDownloadItem(id, item)));
		items.delete(id);
	};

	// TODO: fix download file overwrite
	item.setSavePath(jetpack.path(app.getPath('downloads'), item.getFilename()));

	item.on('updated', handleDownloadUpdated);
	item.once('done', handleDownloadDone);

	items.set(id, item);

	debug('downloading %o to %o', item.getURL(), item.getSavePath());
	(await getStore()).dispatch(downloadStarted(createDownloadItem(id, item)));
};

function* handleClearDownload({ payload: id }) {
	const item = items.get(id);
	if (item) {
		if (item.getState() === 'progressing') {
			item.cancel();
		}

		item.delete(id);
	}

	yield put(downloadCleared(id));
}

function* handleClearAllDownloads() {
	for (const item of items.values()) {
		if (item.getState() === 'progressing') {
			item.cancel();
		}
	}
	items.clear();

	yield put(allDownloadsCleared());
}

const selectToUserData = ({ downloads = [] }) => ({ downloads });

const fetchFromUserData = async (downloads) => {
	(await getStore()).dispatch(downloadsLoaded(downloads));
};

const attachToUserData = () => connectUserData(selectToUserData, fetchFromUserData);

export const useDownloads = async () => {
	waitForAction(getSaga(), APP_READY)(function* () {
		yield takeEvery(CLEAR_DOWNLOAD, handleClearDownload);
		yield takeEvery(CLEAR_ALL_DOWNLOADS, handleClearAllDownloads);
	});

	attachToUserData();

	await app.whenReady();
	session.defaultSession.on('will-download', handleWillDownload);
	debug('%o event listener attached', 'will-download');
};
