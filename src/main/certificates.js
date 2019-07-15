import { app } from 'electron';
import { put, take } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import {
	REPLY_CERTIFICATE_TRUST_REQUEST,
	askForCertificateTrust,
	certificatesLoaded,
	certificateTrusted,
} from '../actions';
import { loadJson, purgeFile } from './userData/fileSystem';
import { certificates as debug } from '../debug';
import { connectUserData } from './userData/store';


const trustRequests = {};

export const registerTrustRequest = (fingerprint, callback) => {
	if (trustRequests[fingerprint]) {
		trustRequests[fingerprint].push(callback);
		return;
	}

	trustRequests[fingerprint] = [callback];
};

export const resolveTrustRequests = (fingerprint, isTrusted) => {
	trustRequests[fingerprint].forEach((callback) => callback(isTrusted));
	delete trustRequests[fingerprint];
};

export const createCertificateEntry = (requestUrl, certificate) => {
	const { host } = parseUrl(requestUrl);
	const { issuerName, data, fingerprint } = certificate;
	const entry = `${ issuerName }\n${ data.toString() }`;

	return { host, fingerprint, entry };
};

export const isCertificateTrusted = (host, entry, certificates) => certificates[host] === entry;

const createCertificateErrorHandler = (getState, dispatch, runSaga) =>
	(event, webContents, requestUrl, error, certificate, callback) => {
		event.preventDefault();

		const { host, fingerprint, entry } = createCertificateEntry(requestUrl, certificate);

		const certificates = (({ certificates }) => certificates)(getState());

		if (isCertificateTrusted(host, entry, certificates)) {
			callback(true);
			return;
		}

		debug('is %o trusted?', entry);
		runSaga(function* () {
			registerTrustRequest(fingerprint, callback);

			yield put(askForCertificateTrust(requestUrl, error, certificate, !!certificates[host]));

			const { payload: isTrusted } = yield take(REPLY_CERTIFICATE_TRUST_REQUEST);

			if (isTrusted) {
				yield put(certificateTrusted(host, entry));
			}

			resolveTrustRequests(fingerprint, isTrusted);
		});
	};

const selectToUserData = ({ certificates = {} }) => ({ certificates });

const fetchFromUserData = (dispatch) => async (certificates) => {
	if (certificates.length === 0) {
		certificates = await loadJson('user', 'certificate.json');
		await purgeFile('user', 'certificate.json');
	}

	dispatch(certificatesLoaded(certificates));
};

export const useCertificates = ({ getState, dispatch, runSaga }) => {
	const handleCertificateError = createCertificateErrorHandler(getState, dispatch, runSaga);
	app.on('certificate-error', handleCertificateError);
	debug('%o event listener attached', 'certificate-error');

	connectUserData(selectToUserData, fetchFromUserData(dispatch));
};
