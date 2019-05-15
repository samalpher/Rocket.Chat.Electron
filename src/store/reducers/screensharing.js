import {
	SHOW_SCREENSHARE_MODAL,
	HIDE_MODAL,
	SCREENSHARING_SOURCE_SELECTED,
} from '../actions';

const initialState = {
	url: null,
	sourceId: null,
};

export const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SHOW_SCREENSHARE_MODAL:
			return {
				...state,
				url: payload,
			};

		case SCREENSHARING_SOURCE_SELECTED:
			return {
				...state,
				sourceId: payload,
			};

		case HIDE_MODAL:
			return initialState;
	}

	return state;
};
