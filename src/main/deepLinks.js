import { app } from 'electron';
import { parse as parseQuery } from 'querystring';
import { parse as parseUrl } from 'url';
import { deepLinks as debug } from '../debug';
import {
	APP_READY,
	processAuthDeepLink,
	processRoomDeepLink,
} from '../store/actions';
import { normalizeServerUrl } from '../utils';
import { waitForAction } from '../utils/store';
import { getStore, getSaga } from './store';


const isRocketChatLink = (link) => parseUrl(link).protocol === 'rocketchat:';

const process = async (link) => {
	const { hostname:	action, query } = parseUrl(link);

	const { host, ...params } = parseQuery(query);

	if (!host) {
		debug('host URL is missing on %o', link);
		return;
	}

	const url = normalizeServerUrl(host);
	if (!url) {
		debug('%o is not a valid host URL', host);
		return;
	}

	switch (action) {
		case 'auth': {
			(await getStore()).dispatch(processAuthDeepLink({ url, ...params }));
			break;
		}

		case 'room': {
			(await getStore()).dispatch(processRoomDeepLink({ url, ...params }));
			break;
		}

		default: {
			debug('the %o action is not supported', action);
		}
	}
};

export const processDeepLink = async (link) => {
	if (!isRocketChatLink(link)) {
		debug('%o is not a Rocket.Chat deep link', link);
		return;
	}

	await process(link);
};

const handleOpenUrl = async (event, link) => {
	if (!isRocketChatLink(link)) {
		debug('%o is not a Rocket.Chat deep link', link);
		return;
	}

	event.preventDefault();

	await process(link);
};

export const useDeepLinks = async () => {
	waitForAction(getSaga(), APP_READY)(() => {
		app.on('open-url', handleOpenUrl);
		debug('%o event listener attached', 'open-url');
	});
};
