import { HISTORY_FLAGS_UPDATED } from '../actions';


const filterFlags = ({
	canGoBack = false,
	canGoForward = false,
}) => ({
	canGoBack,
	canGoForward,
});

export const reducer = (state = filterFlags({}), { type, payload }) => {
	switch (type) {
		case HISTORY_FLAGS_UPDATED: {
			return filterFlags({ ...state, ...payload });
		}
	}

	return state;
};
