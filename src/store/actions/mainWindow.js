export const FOCUS_WINDOW = 'FOCUS_WINDOW';
export const SHOW_WINDOW_IF_NEEDED = 'SHOW_WINDOW_IF_NEEDED';

export const focusWindow = () => ({
	type: FOCUS_WINDOW,
});

export const showWindowIfNeeded = () => ({
	type: SHOW_WINDOW_IF_NEEDED,
});
