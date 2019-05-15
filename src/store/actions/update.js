export const UPDATE_CONFIGURATION_SET = 'UPDATE_CONFIGURATION_SET';
export const CHECKING_FOR_UPDATE_STARTED = 'CHECKING_FOR_UPDATE_STARTED';
export const CHECKING_FOR_UPDATE_STOPPED = 'CHECKING_FOR_UPDATE_STOPPED';
export const UPDATE_VERSION_SET = 'UPDATE_VERSION_SET';
export const SET_CHECKING_FOR_UPDATE_MESSAGE = 'SET_CHECKING_FOR_UPDATE_MESSAGE';
export const UPDATE_DOWNLOAD_PROGRESSED = 'UPDATE_DOWNLOAD_PROGRESSED';
export const UPDATE_DOWNLOAD_COMPLETED = 'UPDATE_DOWNLOAD_COMPLETED';

export const updateConfigurationSet = (configuration) => ({
	type: UPDATE_CONFIGURATION_SET,
	payload: configuration,
});

export const checkingForUpdateStarted = () => ({
	type: CHECKING_FOR_UPDATE_STARTED,
});

export const checkingForUpdateStopped = () => ({
	type: CHECKING_FOR_UPDATE_STOPPED,
});

export const updateVersionSet = (version) => ({
	type: UPDATE_VERSION_SET,
	payload: version,
});

export const setCheckingForUpdateMessage = (message) => ({
	type: SET_CHECKING_FOR_UPDATE_MESSAGE,
	payload: message,
});

export const updateDownloadProgressed = (progress) => ({
	type: UPDATE_DOWNLOAD_PROGRESSED,
	payload: progress,
});

export const updateDownloadCompleted = () => ({
	type: UPDATE_DOWNLOAD_COMPLETED,
});
