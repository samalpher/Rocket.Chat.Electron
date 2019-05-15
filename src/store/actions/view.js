export const VIEW_LOADED = 'VIEW_LOADED';
export const SHOW_LANDING = 'SHOW_LANDING';
export const SHOW_SERVER = 'SHOW_SERVER';
export const SHOW_DOWNLOADS = 'SHOW_DOWNLOADS';
export const SHOW_PREFERENCES = 'SHOW_PREFERENCES';

export const viewLoaded = (view) => ({
	type: VIEW_LOADED,
	payload: view,
});

export const showLanding = () => ({
	type: SHOW_LANDING,
});

export const showServer = (url) => ({
	type: SHOW_SERVER,
	payload: url,
});

export const showDownloads = () => ({
	type: SHOW_DOWNLOADS,
});

export const showPreferences = () => ({
	type: SHOW_PREFERENCES,
});
