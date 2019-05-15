import debug from 'debug';
import { put, take, takeEvery } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { sagaMiddleware, store } from '../store';
import {
	CONFIG_LOADING,
	CERTIFICATE_ERROR_THROWN,
	REPLY_CERTIFICATE_TRUST_REQUEST,
	certificatesLoaded,
	askForCertificateTrust,
	addCertificate,
} from '../store/actions';
import { loadJson, purgeFile } from '../utils';


const loadCertificates = function *({ payload: { certificates } }) {
	if (certificates.length === 0) {
		debug('rc:data')('certificate.json');
		certificates = yield loadJson('certificate.json', 'user');
		yield purgeFile('certificate.json', 'user');
	}

	yield put(certificatesLoaded(certificates));
};

const trustRequests = {};

const certificateErrorThrown = function *({ payload: { event, requestUrl, error, certificate, callback } }) {
	event.preventDefault();

	const { host } = parseUrl(requestUrl);
	const { issuerName, data, fingerprint } = certificate;
	const entry = `${ issuerName }\n${ data.toString() }`;

	const { certificates } = store.getState();

	if (certificates[host] === entry) {
		callback(true);
		return;
	}

	if (trustRequests[fingerprint]) {
		trustRequests[fingerprint].push(callback);
		return;
	}

	trustRequests[fingerprint] = [callback];

	yield put(askForCertificateTrust({ requestUrl, error, certificate, replacing: !!certificates[host] }));

	const { payload: isTrusted } = yield take(REPLY_CERTIFICATE_TRUST_REQUEST);

	if (isTrusted) {
		yield put(addCertificate(host, entry));
	}

	trustRequests[fingerprint].forEach((callback) => callback(isTrusted));
	delete trustRequests[fingerprint];
};

sagaMiddleware.run(function *certificatesSaga() {
	yield takeEvery(CONFIG_LOADING, loadCertificates);
	yield takeEvery(CERTIFICATE_ERROR_THROWN, certificateErrorThrown);
});
