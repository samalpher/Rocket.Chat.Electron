import { app } from 'electron';
import { parse as parseUrl } from 'url';
import { pipe } from '../utils/decorators';


const getCredentialsFromUrl = (url) => {
	const { auth } = parseUrl(url);

	if (!auth) {
		return [];
	}

	return auth.split(':');
};

const findServer = (webContentsUrl) => ({ servers }) => servers.find(({ url }) => webContentsUrl.indexOf(url) === 0);

const getCredentialsFromServer = ({ username, password } = {}) => [username, password];

const selectCredentials = (webContents, request) => {
	const [username, password] = getCredentialsFromUrl(request.url);
	if (username && password) {
		return [username, password];
	}

	const webContentsUrl = webContents.getURL();
	return pipe(findServer(webContentsUrl), getCredentialsFromServer);
};

const createLoginHandler = (getState) => (event, webContents, request, callback) => {
	const [username, password] = selectCredentials(webContents, request)(getState);
	if (!username || !password) {
		return;
	}

	event.preventDefault();

	callback(username, password);
};

export const setupBasicAuth = ({ getState }) => {
	const handleLogin = createLoginHandler(getState);
	app.on('login', handleLogin);
};
