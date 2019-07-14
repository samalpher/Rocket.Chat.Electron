import {
	MAIN_WINDOW_STATE_LOADED,
	MAIN_WINDOW_STATE_UPDATED,
	MAIN_WINDOW_CREATED,
} from '../actions';


const filterState = ({
	x,
	y,
	width = 1000,
	height = 700,
	isMinimized,
	isMaximized,
	isHidden,
}) => ({
	x,
	y,
	width,
	height,
	isMinimized,
	isMaximized,
	isHidden,
});

const initialState = {
	...filterState({}),
	id: null,
};

export const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case MAIN_WINDOW_STATE_LOADED:
		case MAIN_WINDOW_STATE_UPDATED:
			return {
				...state,
				...filterState(payload),
			};

		case MAIN_WINDOW_CREATED:
			return {
				...state,
				id: payload,
			};
	}

	return state;
};
