export const LOAD_WINDOW_STATE = 'LOAD_WINDOW_STATE';
export const UPDATE_WINDOW_STATE = 'UPDATE_WINDOW_STATE';

export const loadWindowState = (state) => ({
	type: LOAD_WINDOW_STATE,
	payload: state,
});

export const updateWindowState = (state) => ({
	type: UPDATE_WINDOW_STATE,
	payload: state,
});
