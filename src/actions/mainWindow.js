export const MAIN_WINDOW_CREATED = 'MAIN_WINDOW_CREATED';
export const MAIN_WINDOW_STATE_LOADED = 'MAIN_WINDOW_STATE_LOADED';
export const MAIN_WINDOW_STATE_UPDATED = 'MAIN_WINDOW_STATE_UPDATED';
export const FOCUS_MAIN_WINDOW = 'FOCUS_MAIN_WINDOW';
export const SHOW_MAIN_WINDOW = 'SHOW_MAIN_WINDOW';
export const HIDE_MAIN_WINDOW = 'HIDE_MAIN_WINDOW';
export const DESTROY_MAIN_WINDOW = 'DESTROY_MAIN_WINDOW';
export const RELOAD_MAIN_WINDOW = 'RELOAD_MAIN_WINDOW';
export const TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW = 'TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW';

export const mainWindowCreated = (id) => ({
	type: MAIN_WINDOW_CREATED,
	payload: id,
});

export const mainWindowStateLoaded = (state) => ({
	type: MAIN_WINDOW_STATE_LOADED,
	payload: state,
});

export const mainWindowStateUpdated = (state) => ({
	type: MAIN_WINDOW_STATE_UPDATED,
	payload: state,
});

export const focusMainWindow = () => ({
	type: FOCUS_MAIN_WINDOW,
});

export const showMainWindow = () => ({
	type: SHOW_MAIN_WINDOW,
});

export const hideMainWindow = () => ({
	type: HIDE_MAIN_WINDOW,
});

export const destroyMainWindow = () => ({
	type: DESTROY_MAIN_WINDOW,
});

export const reloadMainWindow = () => ({
	type: RELOAD_MAIN_WINDOW,
});

export const toggleDevToolsOnMainWindow = () => ({
	type: TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW,
});
