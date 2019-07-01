export const RESET_ZOOM = 'RESET_ZOOM';
export const ZOOM_IN = 'ZOOM_IN';
export const ZOOM_OUT = 'ZOOM_OUT';

export const resetZoom = () => ({
	type: RESET_ZOOM,
});

export const zoomIn = () => ({
	type: ZOOM_IN,
});

export const zoomOut = () => ({
	type: ZOOM_OUT,
});
