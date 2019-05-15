export const LOAD_SERVERS = 'LOAD_SERVERS';
export const ADD_SERVER = 'ADD_SERVER';
export const ADD_SERVER_FROM_URL = 'ADD_SERVER_FROM_URL';
export const REMOVE_SERVER_FROM_URL = 'REMOVE_SERVER_FROM_URL';
export const SORT_SERVERS = 'SORT_SERVERS';
export const SET_SERVER_PROPERTIES = 'SET_SERVER_PROPERTIES';

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
