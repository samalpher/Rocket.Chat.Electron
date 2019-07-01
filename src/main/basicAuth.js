import { app } from 'electron';
import { parse as parseUrl } from 'url';
import { basicAuth as debug } from '../debug';
import { SERVERS_LOADED } from '../actions';
import { waitForAction } from '../utils/store';
import { getStore, getSaga } from './store';
import { pipe } from '../utils/decorators';


const getCredentialsFromUrl = (url) => {
	const { auth } = parseUrl(url);

	if (!auth) {
		return [];
	}

	return auth.split(':');
};

const findServer = (webContentsUrl) => ({ servers }) =>
	servers.find(({ url }) => webContentsUrl.indexOf(url) === 0);

const getCredentialsFromServer = ({ username, password } = {}) => [username, password];

const fetchCredentials = async (webContents, request) => {
	const [username, password] = getCredentialsFromUrl(request.url);
	if (username && password) {
		return [username, password];
	}

	const webContentsUrl = webContents.getURL();
	const findCredentials = pipe(findServer(webContentsUrl), getCredentialsFromServer);
	return findCredentials((await getStore()).getState());
};

const handleLogin = async (event, webContents, request, callback) => {
	const [username, password] = await fetchCredentials(webContents, request);
	if (!username || !password) {
		return;
	}

	event.preventDefault();

	callback(username, password);
};

export const useBasicAuth = () => {
	waitForAction(getSaga(), SERVERS_LOADED)(() => {
		app.on('login', handleLogin);
		debug('%o event listener attached', 'login');
	});
};
