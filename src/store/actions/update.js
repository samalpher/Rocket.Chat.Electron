export const SET_UPDATE_CONFIGURATION = 'SET_UPDATE_CONFIGURATION';
export const STOP_CHECKING_FOR_UPDATE = 'STOP_CHECKING_FOR_UPDATE';
export const SET_UPDATE_VERSION = 'SET_UPDATE_VERSION';
export const SET_CHECKING_FOR_UPDATE_MESSAGE = 'SET_CHECKING_FOR_UPDATE_MESSAGE';
export const START_CHECKING_FOR_UPDATE = 'START_CHECKING_FOR_UPDATE';

export const setUpdateConfiguration = (configuration) => ({
	type: SET_UPDATE_CONFIGURATION,
	payload: configuration,
});

export const stopCheckingForUpdate = () => ({
	type: STOP_CHECKING_FOR_UPDATE,
});

export const setUpdateVersion = (version) => ({
	type: SET_UPDATE_VERSION,
	payload: version,
});

export const setCheckingForUpdateMessage = (message) => ({
	type: SET_CHECKING_FOR_UPDATE_MESSAGE,
	payload: message,
});

export const startCheckingForUpdate = () => ({
	type: START_CHECKING_FOR_UPDATE,
});
