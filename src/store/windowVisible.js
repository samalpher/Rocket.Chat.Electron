import { SHOW_WINDOW, HIDE_WINDOW } from './actions';


export const reducer = (state = true, { type }) => {
	switch (type) {
		case SHOW_WINDOW:
			return true;

		case HIDE_WINDOW:
			return false;
	}

	return state;
};
