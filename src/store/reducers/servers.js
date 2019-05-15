import { format as formatUrl, parse as parseUrl } from 'url';
import {
	LOAD_SERVERS,
	ADD_SERVER,
	ADD_SERVER_FROM_URL,
	REMOVE_SERVER_FROM_URL,
	SORT_SERVERS,
	SET_SERVER_PROPERTIES,
} from '../actions';


export const reducer = (state = [], { type, payload }) => {
	switch (type) {
		case LOAD_SERVERS:
			return [...payload];

		case ADD_SERVER:
			return [...state, payload];

		case ADD_SERVER_FROM_URL: {
			const server = { url: payload };

			const parsedUrl = parseUrl(payload);
			const { auth } = parsedUrl;
			if (auth) {
				server.authUrl = payload;
				delete parsedUrl.auth;
				server.url = formatUrl(parsedUrl);
				[server.username, server.password] = auth.split(':');
			}

			return [...state, server];
		}

		case REMOVE_SERVER_FROM_URL: {
			const index = state.findIndex(({ url }) => url === payload);
			if (index < 0) {
				return state;
			}

			return [...state.slice(0, index), ...state.slice(index + 1)];
		}

		case SORT_SERVERS:
			return state.sort(({ url: a }, { url: b }) => payload.indexOf(a) - payload.indexOf(b));

		case SET_SERVER_PROPERTIES: {
			const { url: serverUrl, ...props } = payload;
			const index = state.findIndex(({ url }) => url === serverUrl);
			if (index < 0) {
				return state;
			}

			const server = { ...state[index], ...props };
			return [...state.slice(0, index), server, ...state.slice(index + 1)];
		}
	}

	return state;
};
