export const SPELLCHECKING_CONFIGURATION_LOADED = 'SPELLCHECKING_CONFIGURATION_LOADED';
export const INSTALL_SPELLCHECKING_DICTIONARIES = 'INSTALL_SPELLCHECKING_DICTIONARIES';
export const SPELLCHECKING_DICTIONARY_INSTALLED = 'SPELLCHECKING_DICTIONARY_INSTALLED';
export const SPELLCHECKING_DICTIONARY_INSTALL_FAILED = 'SPELLCHECKING_DICTIONARY_INSTALL_FAILED';
export const TOGGLE_SPELLCHECKING_DICTIONARY = 'TOGGLE_SPELLCHECKING_DICTIONARY';
export const SPELLCHECKING_DICTIONARIES_ENABLED = 'SPELLCHECKING_DICTIONARIES_ENABLED';
export const UPDATE_SPELLCHECKING_CORRECTIONS = 'UPDATE_SPELLCHECKING_CORRECTIONS';
export const SPELLCHECKING_CORRECTIONS_UPDATED = 'SPELLCHECKING_CORRECTIONS_UPDATED';

export const spellCheckingConfigurationLoaded = (config) => ({
	type: SPELLCHECKING_CONFIGURATION_LOADED,
	payload: config,
});

export const installSpellCheckingDictionaries = (filePaths) => ({
	type: INSTALL_SPELLCHECKING_DICTIONARIES,
	payload: filePaths,
});

export const spellCheckingDictionaryInstalled = (dictionary) => ({
	type: SPELLCHECKING_DICTIONARY_INSTALLED,
	payload: dictionary,
});

export const spellCheckingDictionaryInstallFailed = (dictionary, error) => ({
	type: SPELLCHECKING_DICTIONARY_INSTALL_FAILED,
	payload: { dictionary, error },
});

export const toggleSpellcheckingDictionary = (dictionary, enabled) => ({
	type: TOGGLE_SPELLCHECKING_DICTIONARY,
	payload: { dictionary, enabled },
});

export const spellCheckingDictionariesEnabled = (dictionaries) => ({
	type: SPELLCHECKING_DICTIONARIES_ENABLED,
	payload: dictionaries,
});

export const updateSpellCheckingCorrections = (text) => ({
	type: UPDATE_SPELLCHECKING_CORRECTIONS,
	payload: text,
});

export const spellCheckingCorrectionsUpdated = (corrections) => ({
	type: SPELLCHECKING_CORRECTIONS_UPDATED,
	payload: corrections,
});
