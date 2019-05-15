export const PREFERENCES_LOADED = 'PREFERENCES_LOADED';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const TOGGLE_SPELLCHECKING_DICTIONARY = 'TOGGLE_SPELLCHECKING_DICTIONARY';

export const preferencesLoaded = (preferences) => ({
	type: PREFERENCES_LOADED,
	payload: preferences,
});

export const setPreferences = (preferences) => ({
	type: SET_PREFERENCES,
	payload: preferences,
});

export const toggleSpellcheckingDictionary = (dictionary, enabled) => ({
	type: TOGGLE_SPELLCHECKING_DICTIONARY,
	payload: { dictionary, enabled },
});
