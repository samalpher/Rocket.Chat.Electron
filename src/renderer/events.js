import { remote, clipboard } from 'electron';
import { t } from 'i18next';
import { put, select, take, takeEvery } from 'redux-saga/effects';
import { store, sagaMiddleware } from '../store';
import {
	ASK_FOR_CERTIFICATE_TRUST,
	PROCESS_AUTH_DEEP_LINK,
	SPELLCHECKING_DICTIONARY_INSTALL_FAILED,
	UPDATE_DOWNLOAD_COMPLETED,
	TRIGGER_CONTEXT_MENU,
	SPELLCHECKING_CORRECTIONS_UPDATED,
	SET_SERVER_PROPERTIES,
	showLanding,
	showServer,
	setPreferences,
	toggleSpellcheckingDictionary,
	addServerFromUrl,
	historyFlagsUpdated,
	editFlagsUpdated,
	showAboutModal,
	focusMainWindow,
	clearCertificates,
	replyCertificateTrustRequest,
	installSpellCheckingDictionaries,
	quitAndInstallUpdate,
	resetAppData,
	updateSpellCheckingCorrections,
	reloadWebview,
	showMainWindow,
	openDevToolsForWebview,
	resetZoom,
	zoomIn,
	zoomOut,
	goBackOnWebview,
	goForwardOnWebview,
	WEBVIEW_FOCUSED,
} from '../store/actions';
import { queryEditFlags } from '../utils';
import { migrateDataFromLocalStorage } from './data';
import { MENU_ITEM_CLICKED } from '../store/actions/menus';
const { app, dialog, getCurrentWindow, shell, webContents } = remote;
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

const confirmAppDataReset = () => new Promise((resolve) => {
	dialog.showMessageBox({
		title: t('dialog.resetAppData.title'),
		message: t('dialog.resetAppData.message'),
		type: 'question',
		buttons: [
			t('dialog.resetAppData.yes'),
			t('dialog.resetAppData.cancel'),
		],
		defaultId: 1,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});

const browseForDictionary = () => {
	const { spellchecking: { dictionaryInstallationDirectory } } = store.getState();

	dialog.showOpenDialog(getCurrentWindow(), {
		title: t('dialog.loadDictionary.title'),
		defaultPath: dictionaryInstallationDirectory,
		filters: [
			{ name: t('dialog.loadDictionary.dictionaries'), extensions: ['aff', 'dic'] },
			{ name: t('dialog.loadDictionary.allFiles'), extensions: ['*'] },
		],
		properties: ['openFile', 'multiSelections'],
	}, (filePaths = []) => {
		store.dispatch(installSpellCheckingDictionaries(filePaths));
	});
};

const spellCheckingDictionaryInstallFailed = ({ payload: error }) => {
	console.error(error);
	dialog.showErrorBox(
		t('dialog.loadDictionaryError.title'),
		t('dialog.loadDictionaryError.message', { message: error.message })
	);
};

sagaMiddleware.run(function *spellCheckingSaga() {
	yield takeEvery(SPELLCHECKING_DICTIONARY_INSTALL_FAILED, spellCheckingDictionaryInstallFailed);
});

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

const addServer = async (serverUrl, askForConfirmation = false) => {
	const { servers } = store.getState();
	const index = servers.findIndex(({ url }) => url === serverUrl);

	if (index > -1) {
		store.dispatch(showServer(serverUrl));
		return;
	}

	if (askForConfirmation) {
		const shouldAdd = await confirmServerAddition({ serverUrl });
		if (!shouldAdd) {
			return;
		}
	}

	const result = await validateServer(serverUrl);
	if (result === 'valid') {
		store.dispatch(addServerFromUrl(serverUrl));
		store.dispatch(showServer(serverUrl));
	} else {
		dialog.showErrorBox(
			t('dialog.addServerError.title'),
			t('dialog.addServerError.message', { host: serverUrl })
		);
	}

	return result;
};

const askForCertificateTrust = function *({ payload: { requestUrl, error, certificate, replacing } }) {
	const isTrusted = yield warnCertificateError({ requestUrl, error, certificate, replacing });
	store.dispatch(replyCertificateTrustRequest(isTrusted));
};

sagaMiddleware.run(function *certificatesSaga() {
	yield takeEvery(ASK_FOR_CERTIFICATE_TRUST, askForCertificateTrust);
});

const processAuthDeepLink = function *({ payload: { serverUrl } }) {
	yield put(focusMainWindow());
	yield addServer(serverUrl, true);
};

sagaMiddleware.run(function *deepLinksSaga() {
	yield takeEvery(PROCESS_AUTH_DEEP_LINK, processAuthDeepLink);
});

sagaMiddleware.run(function *contextMenuSaga() {
	yield takeEvery(TRIGGER_CONTEXT_MENU, function *({ payload: params }) {
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
});

const updateDownloadCompleted = function *() {
	const whenInstall = yield askWhenToInstallUpdate();

	if (whenInstall === 'later') {
		yield warnDelayedUpdateInstall();
		return;
	}

	yield put(quitAndInstallUpdate());
};

sagaMiddleware.run(function *updatesSaga() {
	yield takeEvery(UPDATE_DOWNLOAD_COMPLETED, updateDownloadCompleted);
});

sagaMiddleware.run(function *mainWindowSaga() {
	yield takeEvery(SET_SERVER_PROPERTIES, function *({ payload: { badge } }) {
		const { preferences: { showWindowOnUnreadChanged } } = yield select();
		if (typeof badge === 'number' && showWindowOnUnreadChanged) {
			getCurrentWindow().showInactive();
		}
	});
});

let focusedWebContents;

sagaMiddleware.run(function *() {
	yield takeEvery(WEBVIEW_FOCUSED, function *({ payload: { webContentsId } }) {
		focusedWebContents = webContents.fromId(webContentsId);
		console.log(focusedWebContents.id, focusedWebContents.getURL());
	});
});

const getFocusedWebContents = () => focusedWebContents || getCurrentWindow().webContents;

sagaMiddleware.run(function *menusSaga() {
	yield takeEvery(MENU_ITEM_CLICKED, function *({ payload: { action, args } }) {
		switch (action) {
			case 'quit':
				app.quit();
				break;

			case 'about':
				yield put(showAboutModal());
				break;

			case 'open-url': {
				const [url] = args;
				shell.openExternal(url);
				break;
			}

			case 'undo':
				getFocusedWebContents().undo();
				break;

			case 'redo':
				getFocusedWebContents().redo();
				break;

			case 'cut':
				getFocusedWebContents().cut();
				break;

			case 'copy':
				getFocusedWebContents().copy();
				break;

			case 'paste':
				getFocusedWebContents().paste();
				break;

			case 'select-all':
				getFocusedWebContents().selectAll();
				break;

			case 'reset-zoom':
				yield put(resetZoom());
				break;

			case 'zoom-in':
				yield put(zoomIn());
				break;

			case 'zoom-out':
				yield put(zoomOut());
				break;

			case 'add-new-server':
				yield put(showMainWindow());
				yield put(showLanding());
				break;

			case 'select-server': {
				const [{ url }] = args;
				yield put(showMainWindow());
				yield put(showServer(url));
				break;
			}

			case 'reload-server': {
				const [{ ignoringCache = false, clearCertificates: clearCerts = false } = {}] = args;
				const { view: { url } = {} } = yield select();
				if (!url) {
					break;
				}

				if (clearCerts) {
					yield put(clearCertificates());
				}

				yield put(reloadWebview({ url, ignoringCache }));
				break;
			}

			case 'open-devtools-for-server': {
				const { view: { url } = {} } = yield select();
				if (url) {
					yield put(openDevToolsForWebview({ url }));
				}
				break;
			}

			case 'go-back': {
				const { view: { url } = {} } = yield select();
				if (url) {
					yield put(goBackOnWebview({ url }));
				}
				break;
			}

			case 'go-forward': {
				const { view: { url } = {} } = yield select();
				if (url) {
					yield put(goForwardOnWebview({ url }));
				}
				break;
			}

			case 'reload-app':
				getCurrentWindow().reload();
				break;

			case 'toggle-devtools':
				getCurrentWindow().toggleDevTools();
				break;

			case 'reset-app-data': {
				const shouldReset = yield confirmAppDataReset();
				if (shouldReset) {
					yield put(resetAppData());
				}
				break;
			}

			case 'toggle': {
				const [property, value] = args;
				switch (property) {
					case 'hasTray': {
						yield put(setPreferences({ hasTray: value }));
						break;
					}

					case 'hasMenus': {
						yield put(setPreferences({ hasMenus: value }));
						break;
					}

					case 'hasSidebar': {
						yield put(setPreferences({ hasSidebar: value }));
						break;
					}

					case 'showWindowOnUnreadChanged': {
						yield put(setPreferences({ showWindowOnUnreadChanged: value }));
						break;
					}
				}
				break;
			}
		}
	});
});

export default async () => {
	window.addEventListener('beforeunload', () => {
		try {
			getCurrentWindow().removeAllListeners();
		} catch (error) {
			remote.getGlobal('console').error(error.stack || error);
		}
	});

	document.addEventListener('selectionchange', () => {
		store.dispatch(editFlagsUpdated(queryEditFlags()));
		store.dispatch(historyFlagsUpdated({
			canGoBack: false,
			canGoForward: false,
		}));
	});

	contextMenu.on('replace-misspelling', (correction) => getFocusedWebContents().replaceMisspelling(correction));
	contextMenu.on('toggle-dictionary', (dictionary, enabled) => store.dispatch(toggleSpellcheckingDictionary(dictionary, enabled)));
	contextMenu.on('browse-for-dictionary', () => browseForDictionary());
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

	await migrateDataFromLocalStorage();
};
