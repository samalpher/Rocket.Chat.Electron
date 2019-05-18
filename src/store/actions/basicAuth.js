export const BASIC_AUTH_LOGIN_REQUESTED = 'BASIC_AUTH_LOGIN_REQUESTED';

export const basicAuthLoginRequested = (event, webContents, request, authInfo, callback) => ({
	type: BASIC_AUTH_LOGIN_REQUESTED,
	payload: { event, webContents, request, authInfo, callback },
});
