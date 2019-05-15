export const LOAD_CONFIG = 'LOAD_CONFIG';
export const CONFIG_LOADING = 'CONFIG_LOADING';

export const loadConfig = () => ({
	type: LOAD_CONFIG,
});

export const configLoading = (config) => ({
	type: CONFIG_LOADING,
	payload: config,
});
