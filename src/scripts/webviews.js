import { EventEmitter } from 'events';
import * as channels from '../preload/channels';
import { store } from '../store';


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

const onPreload = (channel) => (webview, ...args) => {
	const isReady = webview.classList.contains('webview--ready');
	const f = () => webview.send(channel, ...args);
	isReady ? f() : webview.addEventListener('dom-ready', f);
};

const onWebview = (f) => (webviewSelector, ...args) => {
	const webview = getWebview(webviewSelector);
	if (!webview) {
		return;
	}

	return f.call(null, webview, ...args);
};

const reload = onWebview((webview, { ignoringCache = false, fromUrl = false } = {}) => {
	if (ignoringCache) {
		webview.reloadIgnoringCache();
		return;
	}

	if (fromUrl) {
		webview.loadURL(webview.dataset.url);
		return;
	}

	webview.reload();
});

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

const selectScreenshareSource = onWebview(onPreload(channels.selectScreenshareSource));

const format = onWebview(onPreload(channels.format));

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
		webview.setAttribute('allowpopups', 'on');
		webview.setAttribute('webpreferences', Object.entries({
			webSecurity: false,
		}).map(([key, value]) => `${ key }=${ value ? 'on' : 'off' }`).join(' '));

		webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage.bind(null, url));
		webview.addEventListener('console-message', handleConsoleMessage.bind(null, url));
		webview.addEventListener('ipc-message', handleIpcMessage.bind(null, url));
		webview.addEventListener('dom-ready', handleDomReady.bind(null, url, webview));
		webview.addEventListener('did-fail-load', handleDidFailLoad.bind(null, webview));
		webview.addEventListener('did-get-response-details', handleDidGetResponseDetails.bind(null, webview));
		webview.addEventListener('focus', handleFocus.bind(null, webview));
		webview.addEventListener('blur', handleBlur.bind(null, webview));

		isAllReady = false;

		root.appendChild(webview);
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

const connectToStore = () => {
	const {
		preferences: {
			hasSidebar,
		},
		servers,
		view,
	} = store.getState();

	setState({
		servers,
		activeServerUrl: view.url,
		hasSpacingForTitleBarButtons: !hasSidebar,
	});
};

const mount = () => {
	root = document.body;
	window.addEventListener('focus', handleWindowFocus);
	store.subscribe(connectToStore);
};

export const webviews = Object.assign(events, {
	mount,
	reload,
	openDevTools,
	goBack,
	goForward,
	resetZoom,
	zoomIn,
	zoomOut,
	getWebContents,
	selectScreenshareSource,
	format,
});
