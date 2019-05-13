import { START_LOADING, STOP_LOADING } from './actions';

const initialState = true;

export const reducer = (state = initialState, { type }) => {
	switch (type) {
		case START_LOADING:
			return true;

		case STOP_LOADING:
			return false;
	}

	return state;
};
