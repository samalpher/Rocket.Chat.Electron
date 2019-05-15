export const CERTIFICATES_LOADED = 'CERTIFICATES_LOADED';
export const CLEAR_CERTIFICATES = 'CLEAR_CERTIFICATES';
export const CERTIFICATE_ERROR_THROWN = 'CERTIFICATE_ERROR_THROWN';
export const ASK_FOR_CERTIFICATE_TRUST = 'ASK_FOR_CERTIFICATE_TRUST';
export const REPLY_CERTIFICATE_TRUST_REQUEST = 'REPLY_CERTIFICATE_TRUST_REQUEST';
export const ADD_CERTIFICATE = 'ADD_CERTIFICATE';

export const certificatesLoaded = (certificates) => ({
	type: CERTIFICATES_LOADED,
	payload: certificates,
});

export const clearCertificates = () => ({
	type: CLEAR_CERTIFICATES,
});

export const certificateErrorThrown = (event, webContents, requestUrl, error, certificate, callback) => ({
	type: CERTIFICATE_ERROR_THROWN,
	payload: {
		event,
		webContents,
		requestUrl,
		error,
		certificate,
		callback,
	},
});

export const askForCertificateTrust = ({ requestUrl, error, certificate, replacing }) => ({
	type: ASK_FOR_CERTIFICATE_TRUST,
	payload: {
		requestUrl,
		error,
		certificate,
		replacing,
	},
});

export const replyCertificateTrustRequest = (isTrusted) => ({
	type: REPLY_CERTIFICATE_TRUST_REQUEST,
	payload: isTrusted,
});

export const addCertificate = (host, certificate) => ({
	type: ADD_CERTIFICATE,
	payload: {
		host,
		certificate,
	},
});
