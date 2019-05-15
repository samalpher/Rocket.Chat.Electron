import {
	WINDOW_STATE_LOADED,
	WINDOW_STATE_UPDATED,
} from '../actions';


const filterState = ({
	x,
	y,
	width,
	height,
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

export const reducer = (state = filterState({}), { type, payload }) => {
	switch (type) {
		case WINDOW_STATE_LOADED:
		case WINDOW_STATE_UPDATED:
			return filterState(payload);
	}

	return state;
};
