import { app, session } from 'electron';
import jetpack from 'fs-jetpack';
import { put, takeEvery } from 'redux-saga/effects';
import uniqid from 'uniqid';
import { sagaMiddleware } from '../store';
import {
	APP_READY,
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

const handleDownloadUpdated = (id, item) => () => sagaMiddleware.run(function *handleDownloadUpdated() {
	yield put(downloadUpdated(createDownloadItem(id, item)));
});

const handleDownloadDone = (id, item) => () => sagaMiddleware.run(function *handleDownloadDone() {
	yield put(downloadUpdated(createDownloadItem(id, item)));
});

const handleWillDownload = (event, item) => sagaMiddleware.run(function *handleWillDownload() {
	const id = uniqid();

	item.setSavePath(jetpack.path(app.getPath('downloads'), item.getFilename()));

	item.on('updated', handleDownloadUpdated(id, item));
	item.once('done', handleDownloadDone(id, item));

	yield put(downloadStarted(createDownloadItem(id, item)));
});

function *isAppReady() {
	session.defaultSession.on('will-download', handleWillDownload);
}

sagaMiddleware.run(function *watchDownlodsActions() {
	yield takeEvery(APP_READY, isAppReady);
});
