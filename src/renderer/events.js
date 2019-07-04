import { remote, clipboard } from 'electron';
import { t } from 'i18next';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import { getStore, getSaga } from './store';
import {
	ASK_FOR_CERTIFICATE_TRUST,
	PROCESS_AUTH_DEEP_LINK,
	SPELLCHECKING_DICTIONARY_INSTALL_FAILED,
	UPDATE_DOWNLOAD_COMPLETED,
	TRIGGER_CONTEXT_MENU,
	SPELLCHECKING_CORRECTIONS_UPDATED,
	SET_SERVER_PROPERTIES,
	showServer,
	toggleSpellcheckingDictionary,
	addServerFromUrl,
	historyFlagsUpdated,
	editFlagsUpdated,
	focusMainWindow,
	replyCertificateTrustRequest,
	installSpellCheckingDictionaries,
	quitAndInstallUpdate,
	updateSpellCheckingCorrections,
	WEBVIEW_FOCUSED,
} from '../actions';
import { queryEditFlags } from '../utils';
import { migrateDataFromLocalStorage } from './data';
const { dialog, getCurrentWindow, shell, webContents } = remote;
const { contextMenu } = remote.require('./main');


const askWhenToInstallUpdate = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		type: 'question',
		title: t('dialog.updateReady.title'),
		message: t('dialog.updateReady.message'),
		buttons: [
			t('dialog.updateReady.installLater'),
			t('dialog.updateReady.installNow'),
		],
		defaultId: 1,
		cancelId: 0,
	}, (response) => resolve(response === 0 ? 'later' : 'now'));
});

const warnDelayedUpdateInstall = () => new Promise ((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		type: 'info',
		title: t('dialog.updateInstallLater.title'),
		message: t('dialog.updateInstallLater.message'),
		buttons: [t('dialog.updateInstallLater.ok')],
		defaultId: 0,
	}, () => resolve());
});

const warnCertificateError = ({ requestUrl, error, certificate: { issuerName }, replacing }) => new Promise((resolve) => {
	const detail = `URL: ${ requestUrl }\nError: ${ error }`;

	dialog.showMessageBox(getCurrentWindow(), {
		title: t('dialog.certificateError.title'),
		message: t('dialog.certificateError.message', { issuerName }),
		detail: replacing ? t('error.differentCertificate', { detail }) : detail,
		type: 'warning',
		buttons: [
			t('dialog.certificateError.yes'),
			t('dialog.certificateError.no'),
		],
		defaultId: 1,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});

const confirmServerAddition = ({ serverUrl }) => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: t('dialog.addServer.title'),
		message: t('dialog.addServer.message', { host: serverUrl }),
		type: 'question',
		buttons: [
			t('dialog.addServer.add'),
			t('dialog.addServer.cancel'),
		],
		defaultId: 0,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});

function* browseForDictionary() {
	const { spellchecking: { dictionaryInstallationDirectory } } = yield select();

	dialog.showOpenDialog(getCurrentWindow(), {
		title: t('dialog.loadDictionary.title'),
		defaultPath: dictionaryInstallationDirectory,
		filters: [
			{ name: t('dialog.loadDictionary.dictionaries'), extensions: ['aff', 'dic'] },
			{ name: t('dialog.loadDictionary.allFiles'), extensions: ['*'] },
		],
		properties: ['openFile', 'multiSelections'],
	}, async (filePaths = []) => {
		(await getStore()).dispatch(installSpellCheckingDictionaries(filePaths));
	});
}

const spellCheckingDictionaryInstallFailed = ({ payload: { error } }) => {
	console.error(error);
	dialog.showErrorBox(
		t('dialog.loadDictionaryError.title'),
		t('dialog.loadDictionaryError.message', { message: error.message })
	);
};

const validateServer = async (serverUrl, timeout = 5000) => {
	try {
		const headers = new Headers();

		if (serverUrl.includes('@')) {
			const url = new URL(serverUrl);
			serverUrl = url.origin;
			headers.set('Authorization', `Basic ${ btoa(`${ url.username }:${ url.password }`) }`);
		}
		const response = await Promise.race([
			fetch(`${ serverUrl }/api/info`, { headers }),
			new Promise((resolve, reject) => setTimeout(() => reject('timeout'), timeout)),
		]);

		if (response.status === 401) {
			return 'basic-auth';
		}

		if (!response.ok) {
			return 'invalid';
		}

		const { success } = await response.json();
		if (!success) {
			return 'invalid';
		}

		return 'valid';
	} catch (error) {
		return 'invalid';
	}
};

function* addServer(serverUrl, askForConfirmation = false) {
	const { servers } = yield select();
	const index = servers.findIndex(({ url }) => url === serverUrl);

	if (index > -1) {
		yield put(showServer(serverUrl));
		return;
	}

	if (askForConfirmation) {
		const shouldAdd = yield call(confirmServerAddition, { serverUrl });
		if (!shouldAdd) {
			return;
		}
	}

	const result = yield call(validateServer, serverUrl);
	if (result === 'valid') {
		yield put(addServerFromUrl(serverUrl));
		yield put(showServer(serverUrl));
	} else {
		dialog.showErrorBox(
			t('dialog.addServerError.title'),
			t('dialog.addServerError.message', { host: serverUrl })
		);
	}

	return result;
}

const askForCertificateTrust = function* ({ payload: { requestUrl, error, certificate, replacing } }) {
	const isTrusted = yield warnCertificateError({ requestUrl, error, certificate, replacing });
	yield put(replyCertificateTrustRequest(isTrusted));
};

const processAuthDeepLink = function* ({ payload: { serverUrl } }) {
	yield put(focusMainWindow());
	yield addServer(serverUrl, true);
};

const updateDownloadCompleted = function* () {
	const whenInstall = yield askWhenToInstallUpdate();

	if (whenInstall === 'later') {
		yield warnDelayedUpdateInstall();
		return;
	}

	yield put(quitAndInstallUpdate());
};

let focusedWebContents;

const getFocusedWebContents = () => focusedWebContents || getCurrentWindow().webContents;

function* spellCheckingSaga() {
	yield takeEvery(SPELLCHECKING_DICTIONARY_INSTALL_FAILED, spellCheckingDictionaryInstallFailed);
}

function* certificatesSaga() {
	yield takeEvery(ASK_FOR_CERTIFICATE_TRUST, askForCertificateTrust);
}

function* deepLinksSaga() {
	yield takeEvery(PROCESS_AUTH_DEEP_LINK, processAuthDeepLink);
}

function* contextMenuSaga() {
	yield takeEvery(TRIGGER_CONTEXT_MENU, function* ({ payload: params }) {
		const {
			preferences: {
				enabledDictionaries,
			},
			spellchecking: {
				availableDictionaries,
			},
		} = yield select();
		yield put(updateSpellCheckingCorrections(params.selectionText));

		const { payload: corrections } = yield take(SPELLCHECKING_CORRECTIONS_UPDATED);
		const dictionaries = availableDictionaries.map((dictionary) => ({
			dictionary,
			enabled: enabledDictionaries.includes(dictionary),
		}));

		contextMenu.trigger({ ...params, corrections, dictionaries });
	});
}

function* updatesSaga() {
	yield takeEvery(UPDATE_DOWNLOAD_COMPLETED, updateDownloadCompleted);
}

function* mainWindowSaga() {
	yield takeEvery(SET_SERVER_PROPERTIES, function* ({ payload: { badge } }) {
		const { preferences: { showWindowOnUnreadChanged } } = yield select();
		if (typeof badge === 'number' && showWindowOnUnreadChanged) {
			getCurrentWindow().showInactive();
		}
	});
}

function* webviewFocusSaga() {
	yield takeEvery(WEBVIEW_FOCUSED, function* ({ payload: { webContentsId } }) {
		focusedWebContents = webContents.fromId(webContentsId);
	});
}

const runSagas = async () => (await getSaga()).run(function* () {
	yield* spellCheckingSaga();
	yield* certificatesSaga();
	yield* deepLinksSaga();
	yield* contextMenuSaga();
	yield* updatesSaga();
	yield* mainWindowSaga();
	yield* webviewFocusSaga();
	yield* migrateDataFromLocalStorage();
});

export default async () => {
	window.addEventListener('beforeunload', () => {
		try {
			getCurrentWindow().removeAllListeners();
		} catch (error) {
			remote.getGlobal('console').error(error.stack || error);
		}
	});

	document.addEventListener('selectionchange', async () => {
		(await getStore()).dispatch(editFlagsUpdated(queryEditFlags()));
		(await getStore()).dispatch(historyFlagsUpdated({
			canGoBack: false,
			canGoForward: false,
		}));
	});

	contextMenu.on('replace-misspelling', (correction) => getFocusedWebContents().replaceMisspelling(correction));
	contextMenu.on('toggle-dictionary', async (dictionary, enabled) => (await getStore()).dispatch(toggleSpellcheckingDictionary(dictionary, enabled)));
	contextMenu.on('browse-for-dictionary', async () => (await getSaga()).run(browseForDictionary));
	contextMenu.on('save-image-as', (url) => getFocusedWebContents().downloadURL(url)),
	contextMenu.on('open-link', (url) => shell.openExternal(url));
	contextMenu.on('copy-link-text', ({ text }) => clipboard.write({ text, bookmark: text }));
	contextMenu.on('copy-link-address', ({ text, url }) => clipboard.write({ text: url, bookmark: text }));
	contextMenu.on('undo', () => getFocusedWebContents().undo());
	contextMenu.on('redo', () => getFocusedWebContents().redo());
	contextMenu.on('cut', () => getFocusedWebContents().cut());
	contextMenu.on('copy', () => getFocusedWebContents().copy());
	contextMenu.on('paste', () => getFocusedWebContents().paste());
	contextMenu.on('select-all', () => getFocusedWebContents().selectAll());

	runSagas();
};
