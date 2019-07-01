import { LOADING_DONE } from '../actions';

export const reducer = (state = true, { type }) => {
	switch (type) {
		case LOADING_DONE:
			return false;
	}

	return state;
};
