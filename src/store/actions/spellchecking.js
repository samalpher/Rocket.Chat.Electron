export const LOAD_SPELLCHECKING_CONFIGURATION = 'LOAD_SPELLCHECKING_CONFIGURATION';

export const loadSpellcheckingConfiguration = (config) => ({
	type: LOAD_SPELLCHECKING_CONFIGURATION,
	payload: config,
});
