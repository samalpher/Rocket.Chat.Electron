import querystring from 'querystring';
import url from 'url';
import { mainWindow } from './mainWindow';


const normalizeUrl = (hostUrl) => {
	if (!/^https?:\/\//.test(hostUrl)) {
		return `https://${ hostUrl }`;
	}

	return hostUrl;
};

const processAuth = ({ host, token, userId }) => {
	const window = mainWindow.getBrowserWindow();
	const hostUrl = normalizeUrl(host);
	window.send('add-host', hostUrl, { token, userId });
};

const processRoom = ({ host, rid, path }) => {
	const window = mainWindow.getBrowserWindow();
	const hostUrl = normalizeUrl(host);
	window.send('add-host', hostUrl);
	window.send('open-room', hostUrl, { rid, path });
};

export const processDeepLink = (link) => {
	const { protocol, hostname:	action, query } = url.parse(link);

	if (protocol !== 'rocketchat:') {
		return;
	}

	switch (action) {
		case 'auth': {
			processAuth(querystring.parse(query));
			break;
		}
		case 'room': {
			processRoom(querystring.parse(query));
			break;
		}
	}
};
