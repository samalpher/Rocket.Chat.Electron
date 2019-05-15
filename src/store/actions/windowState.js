export const WINDOW_STATE_LOADED = 'WINDOW_STATE_LOADED';
export const WINDOW_STATE_UPDATED = 'WINDOW_STATE_UPDATED';

export const windowStateLoaded = (state) => ({
	type: WINDOW_STATE_LOADED,
	payload: state,
});

export const windowStateUpdated = (state) => ({
	type: WINDOW_STATE_UPDATED,
	payload: state,
});
