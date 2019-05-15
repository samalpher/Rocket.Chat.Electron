import { put, take, takeEvery } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { sagaMiddleware } from '../store';
import {
	BASIC_AUTH_LOGIN_REQUEST,
	BASIC_AUTH_CREDENTIALS_FETCHED,
	askBasicAuthCredentials,
} from '../store/actions';


const basicAuthLoginRequested = function *({ payload: { event, webContents, request, authInfo, callback } }) {
	const { auth } = parseUrl(request.url);

	if (auth) {
		event.preventDefault();
		const [username, password] = auth.split(':');
		callback(username, password);
		return;
	}

	yield put(askBasicAuthCredentials({ webContentsUrl: webContents.getURL(), request, authInfo }));

	const { payload: credentials } = yield take(BASIC_AUTH_CREDENTIALS_FETCHED);

	if (!credentials) {
		return;
	}

	const { username, password } = credentials;

	if (username && password) {
		event.preventDefault();
		callback(username, password);
	}
};

sagaMiddleware.run(function *basicAuthSaga() {
	yield takeEvery(BASIC_AUTH_LOGIN_REQUEST, basicAuthLoginRequested);
});
