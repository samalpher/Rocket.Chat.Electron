export const START_LOADING = 'START_LOADING';
export const STOP_LOADING = 'STOP_LOADING';

export const SHOW_WINDOW = 'SHOW_WINDOW';
export const HIDE_WINDOW = 'HIDE_WINDOW';

export const LOAD_PREFERENCES = 'LOAD_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const TOGGLE_SPELLCHECKING_DICTIONARY = 'TOGGLE_SPELLCHECKING_DICTIONARY';

export const LOAD_SERVERS = 'LOAD_SERVERS';
export const ADD_SERVER = 'ADD_SERVER';
export const ADD_SERVER_FROM_URL = 'ADD_SERVER_FROM_URL';
export const REMOVE_SERVER_FROM_URL = 'REMOVE_SERVER_FROM_URL';
export const SORT_SERVERS = 'SORT_SERVERS';
export const SET_SERVER_PROPERTIES = 'SET_SERVER_PROPERTIES';

export const LOAD_VIEW = 'LOAD_VIEW';
export const SHOW_LANDING = 'SHOW_LANDING';
export const SHOW_SERVER = 'SHOW_SERVER';
export const SHOW_DOWNLOADS = 'SHOW_DOWNLOADS';
export const SHOW_PREFERENCES = 'SHOW_PREFERENCES';

export const SET_EDIT_FLAGS = 'SET_EDIT_FLAGS';

export const SET_HISTORY_FLAGS = 'SET_HISTORY_FLAGS';

export const startLoading = () => ({ type: START_LOADING });

export const stopLoading = () => ({ type: STOP_LOADING });

export const showWindow = () => ({ type: SHOW_WINDOW });

export const hideWindow = () => ({ type: HIDE_WINDOW });

export const loadServers = (servers) => ({
	type: LOAD_SERVERS,
	payload: servers,
});

export const addServer = (server) => ({
	type: ADD_SERVER,
	payload: server,
});

export const addServerFromUrl = (url) => ({
	type: ADD_SERVER_FROM_URL,
	payload: url,
});

export const removeServerFromUrl = (url) => ({
	type: REMOVE_SERVER_FROM_URL,
	payload: url,
});

export const sortServers = (urls) => ({
	type: SORT_SERVERS,
	payload: urls,
});

export const setServerProperties = ({ url, ...props }) => ({
	type: SET_SERVER_PROPERTIES,
	payload: { url, ...props },
});

export const loadPreferences = (preferences) => ({
	type: LOAD_PREFERENCES,
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

export const loadView = (view) => ({ type: LOAD_VIEW, payload: view });

export const showLanding = () => ({ type: SHOW_LANDING });

export const showServer = (url) => ({ type: SHOW_SERVER, payload: url });

export const showDownloads = () => ({ type: SHOW_DOWNLOADS });

export const showPreferences = () => ({ type: SHOW_PREFERENCES });

export const setEditFlags = (flags) => ({ type: SET_EDIT_FLAGS, payload: flags });

export const setHistoryFlags = (flags) => ({ type: SET_HISTORY_FLAGS, payload: flags });
