import {
	SHOW_ABOUT_MODAL,
	SHOW_SCREENSHARE_MODAL,
	SHOW_UPDATE_MODAL,
	UPDATE_AVAILABLE,
	HIDE_MODAL,
	SKIP_UPDATE,
	DOWNLOAD_UPDATE,
} from '../actions';


export const reducer = (state = null, { type }) => {
	switch (type) {
		case SHOW_ABOUT_MODAL:
			return 'about';

		case SHOW_SCREENSHARE_MODAL:
			return 'screenshare';

		case SHOW_UPDATE_MODAL:
		case UPDATE_AVAILABLE:
			return 'update';

		case HIDE_MODAL:
		case SKIP_UPDATE:
		case DOWNLOAD_UPDATE:
			return null;
	}

	return state;
};
