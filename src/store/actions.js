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

export const SHOW_ABOUT_MODAL = 'SHOW_ABOUT_MODAL';
export const SHOW_SCREENSHARE_MODAL = 'SHOW_SCREENSHARE_MODAL';
export const SHOW_UPDATE_MODAL = 'SHOW_UPDATE_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const SET_UPDATE_CONFIGURATION = 'SET_UPDATE_CONFIGURATION';
export const STOP_CHECKING_FOR_UPDATE = 'STOP_CHECKING_FOR_UPDATE';
export const SET_UPDATE_VERSION = 'SET_UPDATE_VERSION';
export const SET_CHECKING_FOR_UPDATE_MESSAGE = 'SET_CHECKING_FOR_UPDATE_MESSAGE';
export const START_CHECKING_FOR_UPDATE = 'START_CHECKING_FOR_UPDATE';

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

export const showAboutModal = () => ({
	type: SHOW_ABOUT_MODAL,
});

export const showScreenshareModal = (url) => ({
	type: SHOW_SCREENSHARE_MODAL,
	payload: url,
});

export const showUpdateModal = () => ({
	type: SHOW_UPDATE_MODAL,
});

export const hideModal = () => ({ type: HIDE_MODAL });

export const setUpdateConfiguration = (configuration) => ({
	type: SET_UPDATE_CONFIGURATION,
	payload: configuration,
});

export const stopCheckingForUpdate = () => ({
	type: STOP_CHECKING_FOR_UPDATE,
});

export const setUpdateVersion = (version) => ({
	type: SET_UPDATE_VERSION,
	payload: version,
});

export const setCheckingForUpdateMessage = (message) => ({
	type: SET_CHECKING_FOR_UPDATE_MESSAGE,
	payload: message,
});

export const startCheckingForUpdate = () => ({
	type: START_CHECKING_FOR_UPDATE,
});
