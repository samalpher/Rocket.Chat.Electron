import { EventEmitter } from 'events';
import url from 'url';
import { loadJson, writeJson } from '../utils';


let entries = {};
const events = new EventEmitter();

const initialize = async () => {
	entries = await loadJson('certificate.json', 'user');
};

const save = async () => {
	await writeJson('certificate.json', entries);
};

const clear = async () => {
	entries = {};
	await save();
};

const trustRequests = {};

const handleCertificateError = async (event, webContents, requestUrl, error, certificate, callback) => {
	event.preventDefault();

	const { host } = url.parse(requestUrl);
	const { issuerName, data, fingerprint } = certificate;
	const entry = `${ issuerName }\n${ data.toString() }`;

	if (entries[host] === entry) {
		callback(true);
		return;
	}

	if (trustRequests[fingerprint]) {
		trustRequests[fingerprint].push(callback);
		return;
	}

	trustRequests[fingerprint] = [callback];

	const canTrust = await new Promise((callback) => {
		events.emit('ask-for-trust', { requestUrl, error, certificate, replace: !!entries[host], callback });
	});

	if (canTrust) {
		entries[host] = entry;
		await save();
	}

	trustRequests[fingerprint].forEach((callback) => callback(canTrust));
	delete trustRequests[fingerprint];
};

export const certificates = Object.assign(events, {
	initialize,
	clear,
	handleCertificateError,
});
