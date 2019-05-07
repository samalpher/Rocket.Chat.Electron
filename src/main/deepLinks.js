import { EventEmitter } from 'events';
import querystring from 'querystring';
import url from 'url';
import { normalizeServerUrl } from '../utils';


const events = new EventEmitter();

const processAuth = ({ host, token, userId }) => {
	const serverUrl = normalizeServerUrl(host);
	events.emit('auth', { serverUrl, token, userId });
};

const processRoom = ({ host, rid, path }) => {
	const serverUrl = normalizeServerUrl(host);
	events.emit('room', { serverUrl, rid, path });
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
