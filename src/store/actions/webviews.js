export const WEBVIEW_CREATED = 'WEBVIEW_CREATED';
export const WEBVIEW_DESTROYED = 'WEBVIEW_DESTROYED';
export const WEBVIEW_FOCUSED = 'WEBVIEW_FOCUSED';
export const RELOAD_WEBVIEW = 'RELOAD_WEBVIEW';
export const OPEN_DEVTOOLS_FOR_WEBVIEW = 'OPEN_DEVTOOLS_FOR_WEBVIEW';
export const GO_BACK_ON_WEBVIEW = 'GO_BACK_ON_WEBVIEW';
export const GO_FORWARD_ON_WEBVIEW = 'GO_FORWARD_ON_WEBVIEW';

export const webviewCreated = (url, webContentsId) => ({
	type: WEBVIEW_CREATED,
	payload: { url, webContentsId },
});

export const webviewDestroyed = (url, webContentsId) => ({
	type: WEBVIEW_DESTROYED,
	payload: { url, webContentsId },
});

export const webviewFocused = (url, webContentsId) => ({
	type: WEBVIEW_FOCUSED,
	payload: { url, webContentsId },
});

export const reloadWebview = ({ url, webContentsId, ignoringCache = false, fromUrl = false }) => ({
	type: RELOAD_WEBVIEW,
	payload: { url, webContentsId, ignoringCache, fromUrl },
});

export const openDevToolsForWebview = ({ url, webContentsId } = {}) => ({
	type: OPEN_DEVTOOLS_FOR_WEBVIEW,
	payload: { url, webContentsId },
});

export const goBackOnWebview = ({ url, webContentsId } = {}) => ({
	type: GO_BACK_ON_WEBVIEW,
	payload: { url, webContentsId },
});

export const goForwardOnWebview = ({ url, webContentsId } = {}) => ({
	type: GO_FORWARD_ON_WEBVIEW,
	payload: { url, webContentsId },
});
