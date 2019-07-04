import { useEffect, useRef, useState } from 'react';
import { takeEvery, takeLeading } from 'redux-saga/effects';
import { useSaga } from '../../App/SagaMiddlewareProvider';
import {
	RELOAD_WEBVIEW,
	OPEN_DEVTOOLS_FOR_WEBVIEW,
	GO_BACK_ON_WEBVIEW,
	GO_FORWARD_ON_WEBVIEW,
	RESET_ZOOM,
	ZOOM_IN,
	ZOOM_OUT,
} from '../../../../actions';


const get = (webviewRef) => [webviewRef.current, webviewRef.current.getWebContents()];

const useWebviewLifeCycle = (url, webviewRef, onCreate, onDestroy) => {
	useEffect(() => {
		const [, webContents] = get(webviewRef);

		onCreate && onCreate(url, webContents);

		return () => {
			onDestroy && onDestroy(url, webContents);
		};
	}, []);
};

const useWebviewFocus = (url, webviewRef, onFocus) => {
	useEffect(() => {
		const [webview, webContents] = get(webviewRef);

		const handleFocus = () => {
			onFocus && onFocus(url, webContents);
		};

		webview.addEventListener('focus', handleFocus);

		return () => {
			webview.removeEventListener('focus', handleFocus);
		};
	}, []);
};

const useWebviewContextMenu = (url, webviewRef, onContextMenu) => {
	useEffect(() => {
		const [webview, webContents] = get(webviewRef);

		const handleContextMenu = (event) => {
			event.preventDefault();
			const { params } = event;
			onContextMenu && onContextMenu(url, webContents, params);
		};

		webview.addEventListener('context-menu', handleContextMenu);

		return () => {
			webview.removeEventListener('context-menu', handleContextMenu);
		};
	}, []);
};

const useWebviewConsole = (url, webviewRef) => {
	useEffect(() => {
		const webview = webviewRef.current;

		const handleConsoleMessage = ({ level, line, message, sourceId }) => {
			const log = {
				[-1]: console.debug,
				0: console.log,
				1: console.warn,
				2: console.error,
			}[level];
			log(`${ url }\n${ message }\n${ sourceId } : ${ line }`);
		};

		webview.addEventListener('console-message', handleConsoleMessage);

		return () => {
			webview.removeEventListener('console-message', handleConsoleMessage);
		};
	}, []);
};

const useWebviewLoadState = (url, webviewRef, onReady, onDidNavigate) => {
	const [loading, setLoading] = useState(false);
	const [loadingError, setLoadingError] = useState(false);

	useEffect(() => {
		const [webview, webContents] = get(webviewRef);

		const handleReady = () => {
			webview.send('set-server-url', url);
			onReady && onReady(url, webContents);
		};

		const handleDidNavigateInPage = ({ url: lastPath }) => {
			if (lastPath.indexOf(url) !== 0) {
				return;
			}

			onDidNavigate && onDidNavigate(url, webContents, lastPath);
		};

		const handleDidStartLoading = () => {
			setLoading(true);
		};

		const handleDidStopLoading = () => {
			setLoading(false);
		};

		const handleDidFailLoad = ({ isMainFrame }) => {
			if (isMainFrame) {
				setLoadingError(true);
			}
		};

		const handleDidGetResponseDetails = ({ resourceType, httpResponseCode }) => {
			if (resourceType === 'mainFrame' && httpResponseCode >= 500) {
				setLoadingError(true);
				onReady && onReady(url, webContents);
			}
		};

		webview.addEventListener('dom-ready', handleReady);
		webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
		webview.addEventListener('did-start-loading', handleDidStartLoading);
		webview.addEventListener('did-stop-loading', handleDidStopLoading);
		webview.addEventListener('did-fail-load', handleDidFailLoad);
		webview.addEventListener('did-get-response-details', handleDidGetResponseDetails);

		return () => {
			webview.removeEventListener('dom-ready', handleReady);
			webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
			webview.removeEventListener('did-start-loading', handleDidStartLoading);
			webview.removeEventListener('did-stop-loading', handleDidStopLoading);
			webview.removeEventListener('did-fail-load', handleDidFailLoad);
			webview.removeEventListener('did-get-response-details', handleDidGetResponseDetails);
		};
	}, []);

	return [loading, loadingError];
};

const useWebviewActions = (url, webviewRef) => {
	const matchAction = (type) => ({ type: _type, payload }) => {
		if (type !== _type) {
			return false;
		}

		const [, webContents] = get(webviewRef);
		const webContentsId = webContents.id;

		const { url: _url, webContentsId: _webContentsId } = payload || {};
		return _url === url || _webContentsId === webContentsId;
	};

	const doAction = (saga) => function* ({ url, webContentsId, ...payload }) {
		const webview = webviewRef.current;
		yield saga(webview, { ...payload });
	};

	function* reload(webview, { ignoringCache = false, fromUrl = false }) {
		if (ignoringCache) {
			webview.reloadIgnoringCache();
			return;
		}

		if (fromUrl) {
			webview.loadURL(url);
			return;
		}

		webview.reload();
	}

	function* openDevToolsFor(webview) {
		webview.openDevTools();
	}

	function* goBack(webview) {
		webview.goBack();
	}

	function* goForward(webview) {
		webview.goForward();
	}

	function* resetZoom(webview) {
		webview.setZoomLevel(0);
	}

	function* zoomIn(webview) {
		webview.setZoomLevel(webview.getZoomLevel() + 1);
	}

	function* zoomOut(webview) {
		webview.setZoomLevel(webview.getZoomLevel() - 1);
	}

	useSaga(function* watchWebviewsActions() {
		yield takeLeading(matchAction(RELOAD_WEBVIEW), doAction(reload));
		yield takeLeading(matchAction(OPEN_DEVTOOLS_FOR_WEBVIEW), doAction(openDevToolsFor));
		yield takeLeading(matchAction(GO_BACK_ON_WEBVIEW), doAction(goBack));
		yield takeLeading(matchAction(GO_FORWARD_ON_WEBVIEW), doAction(goForward));
		yield takeEvery(RESET_ZOOM, doAction(resetZoom));
		yield takeEvery(ZOOM_IN, doAction(zoomIn));
		yield takeEvery(ZOOM_OUT, doAction(zoomOut));
	});
};

const useWebviewReloadFromError = (url, webviewRef) => {
	const handleReloadFromError = () => {
		const webview = webviewRef.current;

		webview.loadURL(url);
	};

	return handleReloadFromError;
};

export const useWebview = ({
	url,
	lastPath,
	onCreate,
	onDestroy,
	onFocus,
	onContextMenu,
	onReady,
	onDidNavigate,
}) => {
	const webviewRef = useRef(null);

	useEffect(() => {
		setImmediate(() => {
			webviewRef.current.setAttribute('src', lastPath || url);
		});
	}, []);

	useWebviewLifeCycle(url, webviewRef, onCreate, onDestroy);
	useWebviewFocus(url, webviewRef, onFocus);
	useWebviewContextMenu(url, webviewRef, onContextMenu);
	useWebviewConsole(url, webviewRef);
	const [loading, loadingError] = useWebviewLoadState(url, webviewRef, onReady, onDidNavigate);
	useWebviewActions(url, webviewRef);
	const handleReloadFromError = useWebviewReloadFromError(url, webviewRef);

	return {
		webviewRef,
		loading,
		loadingError,
		handleReloadFromError,
	};
};
