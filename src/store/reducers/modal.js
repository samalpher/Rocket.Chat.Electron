import {
	SHOW_ABOUT_MODAL,
	SHOW_SCREENSHARE_MODAL,
	SHOW_UPDATE_MODAL,
	HIDE_MODAL,
} from '../actions';


export const reducer = (state = null, { type }) => {
	switch (type) {
		case SHOW_ABOUT_MODAL:
			return 'about';

		case SHOW_SCREENSHARE_MODAL:
			return 'screenshare';

		case SHOW_UPDATE_MODAL:
			return 'update';

		case HIDE_MODAL:
			return null;
	}

	return state;
};
