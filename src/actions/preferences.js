export const PREFERENCES_LOADED = 'PREFERENCES_LOADED';
export const SET_PREFERENCES = 'SET_PREFERENCES';


export const preferencesLoaded = (preferences) => ({
	type: PREFERENCES_LOADED,
	payload: preferences,
});

export const setPreferences = (preferences) => ({
	type: SET_PREFERENCES,
	payload: preferences,
});
