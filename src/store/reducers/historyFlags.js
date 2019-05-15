import { SET_HISTORY_FLAGS } from '../actions';


const filterFlags = ({
	canGoBack = false,
	canGoForward = false,
}) => ({
	canGoBack,
	canGoForward,
});

export const reducer = (state = filterFlags({}), { type, payload }) => {
	switch (type) {
		case SET_HISTORY_FLAGS: {
			return filterFlags({ ...state, ...payload });
		}
	}

	return state;
};
