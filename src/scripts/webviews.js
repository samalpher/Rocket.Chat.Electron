import { EventEmitter } from 'events';
import { select, takeEvery } from 'redux-saga/effects';
import { connect, store, sagaMiddleware } from '../store';
import { webviewCreated, RELOAD_WEBVIEW, OPEN_DEVTOOLS_FOR_WEBVIEW } from '../store/actions';


let state = {
	servers: [],
	activeServerUrl: null,
	hasSpacingForTitleBarButtons: true,
};

const events = new EventEmitter();

let root;
let activeWebview;
let focusedWebview;
let isAllReady = false;

const getWebview = ({ url, active, focused }) => (
	(url && root.querySelector(`.webview[data-url="${ url }"]`)) ||
	(active && activeWebview) ||
	(focused && focusedWebview)
);

const onWebview = (f) => (webviewSelector, ...args) => {
	const webview = getWebview(webviewSelector);
	if (!webview) {
		return;
	}

	return f.call(null, webview, ...args);
};

const openDevTools = onWebview((webview) => {
	webview.openDevTools();
});

const goBack = onWebview((webview) => {
	webview.goBack();
});

const goForward = onWebview((webview) => {
	webview.goForward();
});

const resetZoom = onWebview((webview) => {
	webview.setZoomLevel(0);
});

const zoomIn = onWebview((webview) => {
	webview.setZoomLevel(webview.getZoomLevel() + 1);
});

const zoomOut = onWebview((webview) => {
	webview.setZoomLevel(webview.getZoomLevel() - 1);
});

const getWebContents = onWebview((webview) => webview.getWebContents());

const getAll = () => Array.from(root.querySelectorAll('.webview'));

const handleDidNavigateInPage = (url, { url: lastPath }) => {
	if (lastPath.indexOf(url) !== 0) {
		return;
	}

	events.emit('did-navigate', url, lastPath);
};

const handleConsoleMessage = (url, { level, line, message, sourceId }) => {
	const levelFormatting = {
		[-1]: 'color: #999',
		0: 'color: #666',
		1: 'color: #990',
		2: 'color: #900',
	}[level];
	const danglingFormatting = (message.match(/%c/g) || []).map(() => '');
	console.log(`%c${ url }\t%c${ message }\n${ sourceId } : ${ line }`,
		'font-weight: bold', levelFormatting, ...danglingFormatting);
};

const handleIpcMessage = (url, { channel, args }) => {
	events.emit(channel, url, ...args);
};

const handleDomReady = (url, webview) => {
	webview.classList.add('webview--ready');
	webview.send('set-server-url', url);

	if (!isAllReady && getAll().every((webview) => webview.classList.contains('webview--ready'))) {
		isAllReady = true;
		events.emit('ready');
	}
};

const handleDidFailLoad = (webview, { isMainFrame }) => {
	if (isMainFrame) {
		webview.loadURL(`file://${ __dirname }/loading-error.html`);
	}
};

const handleDidGetResponseDetails = (webview, { resourceType, httpResponseCode }) => {
	if (resourceType === 'mainFrame' && httpResponseCode >= 500) {
		webview.loadURL(`file://${ __dirname }/loading-error.html`);
	}
};

const handleContextMenu = (webview, event) => {
	event.preventDefault();
	events.emit('context-menu', webview.dataset.url, event.params);
};

const handleFocus = (webview) => {
	focusedWebview = webview;
};

const handleBlur = (webview) => {
	if (focusedWebview === webview) {
		focusedWebview = null;
	}
};

const renderServer = ({ active, hasSpacingForTitleBarButtons, ...server }) => {
	const { url, lastPath } = server;
	const webviewNode = root.querySelector(`.webview[data-url="${ url }"]`);
	const shouldAppend = !webviewNode;

	const webview = webviewNode ? webviewNode : document.createElement('webview');

	webview.classList.add('webview');
	webview.classList.toggle('webview--active', active);

	if (shouldAppend) {
		webview.dataset.url = url;
		webview.setAttribute('preload', '../preload.js');
		webview.setAttribute('allowpopups', true);
		webview.setAttribute('disablewebsecurity', true);
		webview.setAttribute('webpreferences', Object.entries({
			webSecurity: false,
		}).map(([key, value]) => `${ key }=${ value ? 'on' : 'off' }`).join(' '));

		webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage.bind(null, url));
		webview.addEventListener('console-message', handleConsoleMessage.bind(null, url));
		webview.addEventListener('ipc-message', handleIpcMessage.bind(null, url));
		webview.addEventListener('dom-ready', handleDomReady.bind(null, url, webview));
		webview.addEventListener('did-fail-load', handleDidFailLoad.bind(null, webview));
		webview.addEventListener('did-get-response-details', handleDidGetResponseDetails.bind(null, webview));
		webview.addEventListener('context-menu', handleContextMenu.bind(null, webview));
		webview.addEventListener('focus', handleFocus.bind(null, webview));
		webview.addEventListener('blur', handleBlur.bind(null, webview));

		isAllReady = false;

		root.appendChild(webview);
		store.dispatch(webviewCreated(url, webview.getWebContents().id));
		webview.setAttribute('src', lastPath || url);
	}

	if (active) {
		webview.focus();
		activeWebview = webview;
	}
};

const update = () => {
	if (!root) {
		return;
	}

	const {
		servers,
		activeServerUrl,
	} = state;

	const serverUrls = servers.map(({ url }) => url);
	getAll()
		.filter((webview) => !serverUrls.includes(webview.dataset.url))
		.forEach((webview) => webview.remove());

	if (servers.length > 0) {
		servers.forEach((server) => renderServer({
			...server,
			active: server.url === activeServerUrl,
		}));
	} else if (!isAllReady) {
		isAllReady = true;
		events.emit('ready');
	}
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

const handleWindowFocus = () => {
	const active = getWebview({ active: true });
	active && active.focus();
};

let disconnect;

const mount = () => {
	root = document.querySelector('.Webviews');
	window.addEventListener('focus', handleWindowFocus);
	disconnect = connect(({
		preferences: {
			hasSidebar,
		},
		servers,
		view,
	}) => ({
		servers,
		activeServerUrl: view.url,
		hasSpacingForTitleBarButtons: !hasSidebar,
	}))(setState);
};

const unmount = () => {
	disconnect();
	events.removeAllListeners();
};

const reload = function *({ payload: { url, webContentsId, ignoringCache = false, fromUrl = false } }) {
	url = yield url || select(({ webviews }) => {
		const webview = webviews.find(({ webContentsId: id }) => id === webContentsId);
		return webview && webview.url;
	});
	const webview = getWebview({ url });

	if (ignoringCache) {
		webview.reloadIgnoringCache();
		return;
	}

	if (fromUrl) {
		webview.loadURL(webview.dataset.url);
		return;
	}

	webview.reload();
};

const openDevToolsFor = function *({ payload: url }) {
	openDevTools({ url });
};

sagaMiddleware.run(function *() {
	yield takeEvery(RELOAD_WEBVIEW, reload);
	yield takeEvery(OPEN_DEVTOOLS_FOR_WEBVIEW, openDevToolsFor);
});

export const webviews = Object.assign(events, {
	mount,
	unmount,
	openDevTools,
	goBack,
	goForward,
	resetZoom,
	zoomIn,
	zoomOut,
	getWebContents,
});
