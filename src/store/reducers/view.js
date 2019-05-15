import {
	LOAD_VIEW,
	SHOW_LANDING,
	SHOW_SERVER,
	SHOW_DOWNLOADS,
	SHOW_PREFERENCES,
	REMOVE_SERVER_FROM_URL,
} from '../actions';


export const reducer = (state = 'landing', { type, payload }) => {
	switch (type) {
		case LOAD_VIEW:
			return payload;

		case SHOW_LANDING:
			return 'landing';

		case SHOW_SERVER:
			return { url: payload };

		case SHOW_DOWNLOADS:
			return 'downloads';

		case SHOW_PREFERENCES:
			return 'preferences';

		case REMOVE_SERVER_FROM_URL:
			return state.url === payload ? 'landing' : state;
	}

	return state;
};
