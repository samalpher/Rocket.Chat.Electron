import { app } from 'electron';
import { put, take } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { getStore, getSaga } from './store';
import {
	CERTIFICATES_LOADED,
	REPLY_CERTIFICATE_TRUST_REQUEST,
	askForCertificateTrust,
	certificatesLoaded,
	certificateTrusted,
} from '../store/actions';
import { loadJson, purgeFile } from './userData/fileSystem';
import { waitForAction } from '../utils/store';
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

const handleCertificateError = async (event, webContents, requestUrl, error, certificate, callback) => {
	event.preventDefault();

	const { host, fingerprint, entry } = createCertificateEntry(requestUrl, certificate);

	const certificates = (({ certificates }) => certificates)((await getStore()).getState());

	if (isCertificateTrusted(host, entry, certificates)) {
		callback(true);
		return;
	}

	debug('is %o trusted?', entry);
	(await getSaga()).run(function* () {
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

const fetchFromUserData = async (certificates) => {
	if (certificates.length === 0) {
		certificates = await loadJson('user', 'certificate.json');
		await purgeFile('user', 'certificate.json');
	}

	(await getStore()).dispatch(certificatesLoaded(certificates));
};

const attachToUserData = () => connectUserData(selectToUserData, fetchFromUserData);

export const useCertificates = () => {
	waitForAction(getSaga(), CERTIFICATES_LOADED)(() => {
		app.on('certificate-error', handleCertificateError);
		debug('%o event listener attached', 'certificate-error');
	});

	attachToUserData();
};
