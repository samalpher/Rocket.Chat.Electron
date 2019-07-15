import {
	UPDATE_CONFIGURATION_LOADED,
	CHECKING_FOR_UPDATE_STARTED,
	CHECKING_FOR_AUTO_UPDATE_STARTED,
	CHECKING_FOR_UPDATE_STOPPED,
	UPDATE_DOWNLOAD_PROGRESSED,
	UPDATE_DOWNLOAD_COMPLETED,
	CHECKING_FOR_UPDATE_ERRORED,
	UPDATE_NOT_AVAILABLE,
	UPDATE_AVAILABLE,
	UPDATE_DOWNLOAD_ERRORED,
} from '../actions';


const initialState = {
	adminConfiguration: false,
	canSetAutoUpdate: false,
	checking: null,
	version: null,
	download: null,
};

export const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case UPDATE_CONFIGURATION_LOADED:
			return {
				...state,
				adminConfiguration: payload.adminConfiguration,
				canSetAutoUpdate: payload.canSetAutoUpdate,
			};

		case CHECKING_FOR_UPDATE_STARTED:
			return {
				...state,
				checking: {
					mode: 'normal',
				},
			};

		case CHECKING_FOR_AUTO_UPDATE_STARTED:
			return {
				...state,
				checking: {
					mode: 'auto',
				},
			};

		case CHECKING_FOR_UPDATE_STOPPED:
			return {
				...state,
				checking: null,
			};

		case CHECKING_FOR_UPDATE_ERRORED:
			return {
				...state,
				checking: null,
			};

		case UPDATE_NOT_AVAILABLE:
			return {
				...state,
				checking: null,
				version: null,
			};

		case UPDATE_AVAILABLE:
			return {
				...state,
				checking: null,
				version: payload,
			};

		case UPDATE_DOWNLOAD_ERRORED:
			return {
				...state,
				download: null,
			};

		case UPDATE_DOWNLOAD_PROGRESSED: {
			const { bytesPerSecond, percent, total, transferred } = payload;
			return {
				...state,
				download: {
					bytesPerSecond,
					percent,
					total,
					transferred,
				},
			};
		}

		case UPDATE_DOWNLOAD_COMPLETED:
			return {
				...state,
				download: null,
			};
	}

	return state;
};
