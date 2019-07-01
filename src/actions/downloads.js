export const DOWNLOADS_LOADED = 'DOWNLOADS_LOADED';
export const DOWNLOAD_STARTED = 'DOWNLOAD_STARTED';
export const DOWNLOAD_UPDATED = 'DOWNLOAD_UPDATED';
export const CLEAR_DOWNLOAD = 'CLEAR_DOWNLOAD';
export const DOWNLOAD_CLEARED = 'DOWNLOAD_CLEARED';
export const CLEAR_ALL_DOWNLOADS = 'CLEAR_ALL_DOWNLOADS';
export const ALL_DOWNLOADS_CLEARED = 'ALL_DOWNLOADS_CLEAR';

export const downloadsLoaded = (downloads) => ({
	type: DOWNLOADS_LOADED,
	payload: downloads,
});

export const downloadStarted = (download) => ({
	type: DOWNLOAD_STARTED,
	payload: download,
});

export const downloadUpdated = (download) => ({
	type: DOWNLOAD_UPDATED,
	payload: download,
});

export const clearDownload = (id) => ({
	type: CLEAR_DOWNLOAD,
	payload: id,
});

export const downloadCleared = (id) => ({
	type: DOWNLOAD_CLEARED,
	payload: id,
});

export const clearAllDownloads = () => ({
	type: CLEAR_ALL_DOWNLOADS,
});

export const allDownloadsCleared = () => ({
	type: ALL_DOWNLOADS_CLEARED,
});
