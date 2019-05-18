import { select, takeEvery } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { sagaMiddleware } from '../store';
import { BASIC_AUTH_LOGIN_REQUESTED } from '../store/actions';


const basicAuthLoginRequested = function *({ payload: { event, webContents, request, callback } }) {
	const { auth } = parseUrl(request.url);

	if (auth) {
		event.preventDefault();
		const [username, password] = auth.split(':');
		callback(username, password);
		return;
	}

	const webContentsUrl = webContents.getURL();
	const credentials = yield select(({ servers }) => servers.find(({ url }) => webContentsUrl.indexOf(url) === 0));

	if (!credentials || !credentials.username || !credentials.password) {
		return;
	}

	const { username, password } = credentials;
	event.preventDefault();
	callback(username, password);
};

sagaMiddleware.run(function *watchBasicAuthActions() {
	yield takeEvery(BASIC_AUTH_LOGIN_REQUESTED, basicAuthLoginRequested);
});
