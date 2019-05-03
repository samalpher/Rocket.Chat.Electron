import { EventEmitter } from 'events';
import querystring from 'querystring';
import url from 'url';


const events = new EventEmitter();

const normalizeUrl = (hostUrl) => {
	if (!/^https?:\/\//.test(hostUrl)) {
		return `https://${ hostUrl }`;
	}

	return hostUrl;
};

const processAuth = ({ host, token, userId }) => {
	const hostUrl = normalizeUrl(host);
	events.emit('auth', { hostUrl, token, userId });
};

const processRoom = ({ host, rid, path }) => {
	const hostUrl = normalizeUrl(host);
	events.emit('room', { hostUrl, rid, path });
};

const handle = (link) => {
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

export const deepLinks = Object.assign(events, {
	handle,
});
