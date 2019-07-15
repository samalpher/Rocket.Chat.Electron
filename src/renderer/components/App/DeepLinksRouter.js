import { remote } from 'electron';
import { parse as parseQuery } from 'querystring';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { parse as parseUrl } from 'url';
import {
	processAuthDeepLink,
	processRoomDeepLink,
} from '../../../actions';
import { deepLinks as debug } from '../../../debug';
import { normalizeServerUrl } from '../../../utils';


const isRocketChatLink = (link) => parseUrl(link).protocol === 'rocketchat:';

const createDeepLinkHandler = (dispatch) => (link) => {
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
			dispatch(processAuthDeepLink({ url, ...params }));
			break;
		}

		case 'room': {
			dispatch(processRoomDeepLink({ url, ...params }));
			break;
		}

		default: {
			debug('the %o action is not supported', action);
		}
	}
};

const useDeepLinks = () => {
	const dispatch = useDispatch();

	const handleDeepLink = createDeepLinkHandler(dispatch);

	useEffect(() => {
		const handleOpenUrl = (event, link) => {
			if (!isRocketChatLink(link)) {
				debug('%o is not a Rocket.Chat deep link', link);
				return;
			}

			event.preventDefault();

			handleDeepLink(link);
		};

		const handleSecondInstanceLaunch = (event, argv) => {
			const args = argv.slice(2);
			for (const link of args) {
				if (!isRocketChatLink(link)) {
					debug('%o is not a Rocket.Chat deep link', link);
					return;
				}

				handleDeepLink(link);
			}
		};

		remote.app.on('open-url', handleOpenUrl);

		remote.app.on('second-instance', handleSecondInstanceLaunch);

		return () => {
			remote.app.off('open-url', handleOpenUrl);

			remote.app.off('second-instance', handleSecondInstanceLaunch);
		};
	}, [handleDeepLink]);

	useEffect(() => {
		const args = remote.process.argv.slice(2);
		for (const link of args) {
			if (!isRocketChatLink(link)) {
				debug('%o is not a Rocket.Chat deep link', link);
				return;
			}

			handleDeepLink(link);
		}
	}, []);
};

export function DeepLinksRouter({ children }) {
	useDeepLinks();
	return <>{children}</>;
}
