export const INITIALIZE_CONFIG = 'INITIALIZE_CONFIG';
export const LOAD_CONFIG = 'LOAD_CONFIG';

export const initializeConfig = () => ({
	type: INITIALIZE_CONFIG,
});

export const loadConfig = (config) => ({
	type: LOAD_CONFIG,
	payload: config,
});

