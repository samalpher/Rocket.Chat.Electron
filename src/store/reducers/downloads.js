import {
	DOWNLOAD_STARTED,
	DOWNLOAD_UPDATED,
} from '../actions';


export const reducer = (state = [], { type, payload }) => {
	switch (type) {
		case DOWNLOAD_STARTED:
			return [
				...state,
				payload,
			];

		case DOWNLOAD_UPDATED:
			return state.map((download) => (download.id === payload.id ? payload : download));
	}

	return state;
};
