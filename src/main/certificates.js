import debug from 'debug';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { sagaMiddleware } from '../store';
import {
	CERTIFICATE_ERROR_THROWN,
	LOAD_CONFIG,
	REPLY_CERTIFICATE_TRUST_REQUEST,
	addCertificate,
	askForCertificateTrust,
	certificatesLoaded,
} from '../store/actions';
import { loadJson, purgeFile } from '../utils';


const doLoadConfig = function *({ payload: { certificates } }) {
	if (certificates.length === 0) {
		debug('rc:data')('certificate.json');
		certificates = yield call(loadJson, 'certificate.json', 'user');
		yield call(purgeFile, 'certificate.json', 'user');
	}

	yield put(certificatesLoaded(certificates));
};

const trustRequests = {};

const didCertificateErrorThrow = function *({ payload: { event, requestUrl, error, certificate, callback } }) {
	event.preventDefault();

	const { host } = parseUrl(requestUrl);
	const { issuerName, data, fingerprint } = certificate;
	const entry = `${ issuerName }\n${ data.toString() }`;

	const { certificates } = yield select();

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

sagaMiddleware.run(function *watchCertificatesActions() {
	yield takeEvery(LOAD_CONFIG, doLoadConfig);
	yield takeEvery(CERTIFICATE_ERROR_THROWN, didCertificateErrorThrow);
});
