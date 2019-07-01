export const CERTIFICATES_LOADED = 'CERTIFICATES_LOADED';
export const CLEAR_CERTIFICATES = 'CLEAR_CERTIFICATES';
export const ASK_FOR_CERTIFICATE_TRUST = 'ASK_FOR_CERTIFICATE_TRUST';
export const REPLY_CERTIFICATE_TRUST_REQUEST = 'REPLY_CERTIFICATE_TRUST_REQUEST';
export const CERTIFICATE_TRUSTED = 'CERTIFICATE_TRUSTED';

export const certificatesLoaded = (certificates) => ({
	type: CERTIFICATES_LOADED,
	payload: certificates,
});

export const clearCertificates = () => ({
	type: CLEAR_CERTIFICATES,
});

export const askForCertificateTrust = (requestUrl, error, certificate, replacing) => ({
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

export const certificateTrusted = (host, certificate) => ({
	type: CERTIFICATE_TRUSTED,
	payload: {
		host,
		certificate,
	},
});
