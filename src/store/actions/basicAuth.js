export const BASIC_AUTH_LOGIN_REQUEST = 'BASIC_AUTH_LOGIN_REQUEST';
export const ASK_BASIC_AUTH_CREDENTIALS = 'ASK_BASIC_AUTH_CREDENTIALS';
export const BASIC_AUTH_CREDENTIALS_FETCHED = 'BASIC_AUTH_CREDENTIALS_FETCHED';

export const basicAuthLoginRequested = (event, webContents, request, authInfo, callback) => ({
	type: BASIC_AUTH_LOGIN_REQUEST,
	payload: { event, webContents, request, authInfo, callback },
});

export const askBasicAuthCredentials = ({ webContentsUrl, request, authInfo }) => ({
	type: ASK_BASIC_AUTH_CREDENTIALS,
	payload: { webContentsUrl, request, authInfo },
});

export const basicAuthCredentialsFetched = (credentials) => ({
	type: BASIC_AUTH_CREDENTIALS_FETCHED,
	payload: credentials,
});
