import {
	DOWNLOADS_LOADED,
	DOWNLOAD_STARTED,
	DOWNLOAD_UPDATED,
	DOWNLOAD_CLEARED,
	ALL_DOWNLOADS_CLEARED,
} from '../actions';


export const reducer = (state = [], { type, payload }) => {
	switch (type) {
		case DOWNLOADS_LOADED:
			return [...payload];

		case DOWNLOAD_STARTED:
			return [
				...state,
				payload,
			];

		case DOWNLOAD_UPDATED:
			return state.map((download) => (download.id === payload.id ? payload : download));

		case DOWNLOAD_CLEARED:
			return state.filter(({ id }) => id !== payload);

		case ALL_DOWNLOADS_CLEARED:
			return [];
	}

	return state;
};
