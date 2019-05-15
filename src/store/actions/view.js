export const LOAD_VIEW = 'LOAD_VIEW';
export const SHOW_LANDING = 'SHOW_LANDING';
export const SHOW_SERVER = 'SHOW_SERVER';
export const SHOW_DOWNLOADS = 'SHOW_DOWNLOADS';
export const SHOW_PREFERENCES = 'SHOW_PREFERENCES';

export const loadView = (view) => ({
	type: LOAD_VIEW,
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
