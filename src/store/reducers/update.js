import {
	UPDATE_CONFIGURATION_SET,
	CHECKING_FOR_UPDATE_STARTED,
	CHECKING_FOR_UPDATE_STOPPED,
	SET_CHECKING_FOR_UPDATE_MESSAGE,
	UPDATE_VERSION_SET,
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
		case UPDATE_CONFIGURATION_SET:
			return { ...state, ...filterUpdateConfiguration(payload) };

		case CHECKING_FOR_UPDATE_STARTED:
			return {
				...state,
				checking: true,
			};

		case CHECKING_FOR_UPDATE_STOPPED:
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

		case UPDATE_VERSION_SET:
			return {
				...state,
				version: payload,
			};
	}

	return state;
};
