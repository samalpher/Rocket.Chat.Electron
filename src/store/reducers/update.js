import {
	SET_UPDATE_CONFIGURATION,
	START_CHECKING_FOR_UPDATE,
	STOP_CHECKING_FOR_UPDATE,
	SET_CHECKING_FOR_UPDATE_MESSAGE,
	SET_UPDATE_VERSION,
} from '../actions';


const filterUpdateConfiguration = ({
	canUpdate = false,
	canAutoUpdate = false,
	canSetAutoUpdate = false,
}) => ({
	canUpdate,
	canAutoUpdate,
	canSetAutoUpdate,
});

const initialState = {
	...filterUpdateConfiguration({}),
	checking: false,
	checkingMessage: null,
	version: null,
};

export const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SET_UPDATE_CONFIGURATION:
			return { ...state, ...filterUpdateConfiguration(payload) };

		case START_CHECKING_FOR_UPDATE:
			return {
				...state,
				checking: true,
			};

		case STOP_CHECKING_FOR_UPDATE:
			return {
				...state,
				checking: false,
				checkingMessage: null,
			};

		case SET_CHECKING_FOR_UPDATE_MESSAGE:
			return {
				...state,
				checking: true,
				checkingMessage: payload,
			};

		case SET_UPDATE_VERSION:
			return {
				...state,
				version: payload,
			};
	}

	return state;
};
