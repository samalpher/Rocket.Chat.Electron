import { remote } from 'electron';
import { t } from 'i18next';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { getStore, getSaga } from './store';
import {
	ASK_FOR_CERTIFICATE_TRUST,
	PROCESS_AUTH_DEEP_LINK,
	UPDATE_DOWNLOAD_COMPLETED,
	showServer,
	addServerFromUrl,
	historyFlagsUpdated,
	editFlagsUpdated,
	focusMainWindow,
	replyCertificateTrustRequest,
	quitAndInstallUpdate,
	SPELLCHECKING_DICTIONARY_INSTALL_FAILED,
	SET_SERVER_PROPERTIES,
} from '../actions';
import { queryEditFlags } from '../utils';
import { migrateDataFromLocalStorage } from './data';
const { dialog, getCurrentWindow } = remote;


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

function* certificatesSaga() {
	yield takeEvery(ASK_FOR_CERTIFICATE_TRUST, askForCertificateTrust);
}

function* deepLinksSaga() {
	yield takeEvery(PROCESS_AUTH_DEEP_LINK, processAuthDeepLink);
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

const spellCheckingDictionaryInstallFailed = ({ payload: { error } }) => {
	console.error(error);
	remote.dialog.showErrorBox(
		t('dialog.loadDictionaryError.title'),
		t('dialog.loadDictionaryError.message', { message: error.message })
	);
};

function* spellCheckingSaga() {
	yield takeEvery(SPELLCHECKING_DICTIONARY_INSTALL_FAILED, spellCheckingDictionaryInstallFailed);
}

const runSagas = async () => (await getSaga()).run(function* () {
	yield* spellCheckingSaga();
	yield* certificatesSaga();
	yield* deepLinksSaga();
	yield* updatesSaga();
	yield* mainWindowSaga();
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

	runSagas();
};
