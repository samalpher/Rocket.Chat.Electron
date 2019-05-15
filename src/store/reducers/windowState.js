import {
	LOAD_WINDOW_STATE,
	UPDATE_WINDOW_STATE,
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
		case LOAD_WINDOW_STATE:
		case UPDATE_WINDOW_STATE:
			return filterState(payload);
	}

	return state;
};
