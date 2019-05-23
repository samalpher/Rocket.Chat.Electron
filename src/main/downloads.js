import { app, session } from 'electron';
import jetpack from 'fs-jetpack';
import { put, takeEvery } from 'redux-saga/effects';
import uniqid from 'uniqid';
import { sagaMiddleware } from '../store';
import {
	APP_READY,
	CLEAR_ALL_DOWNLOADS,
	CLEAR_DOWNLOAD,
	LOAD_CONFIG,
	allDownloadsCleared,
	downloadCleared,
	downloadsLoaded,
	downloadStarted,
	downloadUpdated,
} from '../store/actions';


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

const handleDownloadUpdated = (id, item) => () => sagaMiddleware.run(function *handleDownloadUpdated() {
	yield put(downloadUpdated(createDownloadItem(id, item)));
});

const handleDownloadDone = (id, item) => () => sagaMiddleware.run(function *handleDownloadDone() {
	yield put(downloadUpdated(createDownloadItem(id, item)));
	items.delete(id);
});

const handleWillDownload = (event, item) => sagaMiddleware.run(function *handleWillDownload() {
	const id = uniqid();

	item.setSavePath(jetpack.path(app.getPath('downloads'), item.getFilename()));

	item.on('updated', handleDownloadUpdated(id, item));
	item.once('done', handleDownloadDone(id, item));

	items.set(id, item);

	yield put(downloadStarted(createDownloadItem(id, item)));
});

const doLoadConfig = function *({ payload: { downloads } }) {
	yield put(downloadsLoaded(downloads));
};


function *isAppReady() {
	session.defaultSession.on('will-download', handleWillDownload);
}

function *doClearDownload({ payload: id }) {
	const item = items.get(id);
	if (item) {
		if (item.getState() === 'progressing') {
			item.cancel();
		}

		item.delete(id);
	}

	yield put(downloadCleared(id));
}

function *doClearAllDownloads() {
	for (const item of items.values()) {
		if (item.getState() === 'progressing') {
			item.cancel();
		}
	}
	items.clear();

	yield put(allDownloadsCleared());
}

sagaMiddleware.run(function *watchDownlodsActions() {
	yield takeEvery(LOAD_CONFIG, doLoadConfig);
	yield takeEvery(APP_READY, isAppReady);
	yield takeEvery(CLEAR_DOWNLOAD, doClearDownload);
	yield takeEvery(CLEAR_ALL_DOWNLOADS, doClearAllDownloads);
});
