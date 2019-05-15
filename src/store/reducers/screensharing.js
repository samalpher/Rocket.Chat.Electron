import {
	SHOW_SCREENSHARE_MODAL,
	HIDE_MODAL,
} from '../actions';


export const reducer = (state = null, { type, payload }) => {
	switch (type) {
		case SHOW_SCREENSHARE_MODAL:
			return payload || null;

		case HIDE_MODAL:
			return null;
	}

	return state;
};
