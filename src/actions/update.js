export const UPDATE_CONFIGURATION_LOADED = 'UPDATE_CONFIGURATION_LOADED';
export const SET_AUTO_UPDATE = 'SET_AUTO_UPDATE';
export const AUTO_UPDATE_SET = 'AUTO_UPDATE_SET';
export const CHECK_FOR_UPDATE = 'CHECK_FOR_UPDATE';
export const CHECKING_FOR_UPDATE_STARTED = 'CHECKING_FOR_UPDATE_STARTED';
export const CHECKING_FOR_AUTO_UPDATE_STARTED = 'CHECKING_FOR_AUTO_UPDATE_STARTED';
export const CHECKING_FOR_UPDATE_STOPPED = 'CHECKING_FOR_UPDATE_STOPPED';
export const CHECKING_FOR_UPDATE_ERRORED = 'CHECKING_FOR_UPDATE_ERRORED';
export const UPDATE_NOT_AVAILABLE = 'UPDATE_NOT_AVAILABLE';
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const SKIP_UPDATE = 'SKIP_UPDATE';
export const UPDATE_SKIPPED = 'UPDATE_SKIPPED';
export const DOWNLOAD_UPDATE = 'DOWNLOAD_UPDATE';
export const UPDATE_DOWNLOAD_ERRORED = 'UPDATE_DOWNLOAD_ERRORED';
export const UPDATE_DOWNLOAD_PROGRESSED = 'UPDATE_DOWNLOAD_PROGRESSED';
export const UPDATE_DOWNLOAD_COMPLETED = 'UPDATE_DOWNLOAD_COMPLETED';
export const QUIT_AND_INSTALL_UPDATE = 'QUIT_AND_INSTALL_UPDATE';


export const updateConfigurationLoaded = (configuration) => ({
	type: UPDATE_CONFIGURATION_LOADED,
	payload: configuration,
});

export const setAutoUpdate = (enabled) => ({
	type: SET_AUTO_UPDATE,
	payload: enabled,
});

export const autoUpdateSet = (enabled) => ({
	type: AUTO_UPDATE_SET,
	payload: enabled,
});

export const checkForUpdate = () => ({
	type: CHECK_FOR_UPDATE,
});

export const checkingForUpdateStarted = () => ({
	type: CHECKING_FOR_UPDATE_STARTED,
});

export const checkingForAutoUpdateStarted = () => ({
	type: CHECKING_FOR_AUTO_UPDATE_STARTED,
});

export const checkingForUpdateStopped = () => ({
	type: CHECKING_FOR_UPDATE_STOPPED,
});

export const checkingForUpdateErrored = (error) => ({
	type: CHECKING_FOR_UPDATE_ERRORED,
	payload: error,
});

export const updateNotAvailable = () => ({
	type: UPDATE_NOT_AVAILABLE,
});

export const updateAvailable = (version) => ({
	type: UPDATE_NOT_AVAILABLE,
	payload: version,
});

export const skipUpdate = () => ({
	type: SKIP_UPDATE,
});

export const updateSkipped = (version) => ({
	type: UPDATE_SKIPPED,
	payload: version,
});

export const downloadUpdate = () => ({
	type: DOWNLOAD_UPDATE,
});

export const updateDownloadErrored = (error) => ({
	type: UPDATE_DOWNLOAD_ERRORED,
	payload: error,
});

export const updateDownloadProgressed = (progress) => ({
	type: UPDATE_DOWNLOAD_PROGRESSED,
	payload: progress,
});

export const updateDownloadCompleted = () => ({
	type: UPDATE_DOWNLOAD_COMPLETED,
});

export const quitAndInstallUpdate = (info) => ({
	type: QUIT_AND_INSTALL_UPDATE,
	payload: info,
});
