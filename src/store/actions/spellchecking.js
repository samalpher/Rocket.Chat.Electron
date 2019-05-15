export const SPELLCHECKING_CONFIGURATION_LOADED = 'SPELLCHECKING_CONFIGURATION_LOADED';

export const spellcheckingConfigurationLoaded = (config) => ({
	type: SPELLCHECKING_CONFIGURATION_LOADED,
	payload: config,
});
