export const DOWNLOAD_STARTED = 'DOWNLOAD_STARTED';
export const DOWNLOAD_UPDATED = 'DOWNLOAD_UPDATED';

export const downloadStarted = (download) => ({
	type: DOWNLOAD_STARTED,
	payload: download,
});

export const downloadUpdated = (download) => ({
	type: DOWNLOAD_UPDATED,
	payload: download,
});
