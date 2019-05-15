export const FOCUS_WINDOW = 'FOCUS_WINDOW';
export const SHOW_WINDOW = 'SHOW_WINDOW';
export const DESTROY_WINDOW = 'DESTROY_WINDOW';

export const focusWindow = () => ({
	type: FOCUS_WINDOW,
});

export const showWindow = () => ({
	type: SHOW_WINDOW,
});

export const destroyWindow = () => ({
	type: DESTROY_WINDOW,
});
