import { EventEmitter } from 'events';
// import { connect, store } from '../store';


// let state = {
// 	servers: [],
// 	activeServerUrl: null,
// 	hasSpacingForTitleBarButtons: true,
// };

const events = new EventEmitter();

let root;
let activeWebview;
let focusedWebview;
// let isAllReady = false;

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

// const getAll = () => Array.from(root.querySelectorAll('.webview'));

// const handleDomReady = (url, webview) => {
// 	// webview.classList.add('webview--ready');
// 	webview.send('set-server-url', url);

// 	if (!isAllReady && getAll().every((webview) => webview.classList.contains('webview--ready'))) {
// 		isAllReady = true;
// 		events.emit('ready');
// 	}
// };

// const handleFocus = (webview) => {
// 	focusedWebview = webview;
// };

// const handleBlur = (webview) => {
// 	if (focusedWebview === webview) {
// 		focusedWebview = null;
// 	}
// };

// const renderServer = ({ active, hasSpacingForTitleBarButtons, ...server }) => {
// 	const { url, lastPath } = server;
// 	const webviewNode = root.querySelector(`.webview[data-url="${ url }"]`);
// 	const shouldAppend = !webviewNode;

// 	const webview = webviewNode ? webviewNode : document.createElement('webview');

// 	webview.classList.add('webview');
// 	webview.classList.toggle('webview--active', active);

// 	if (shouldAppend) {
// 		webview.dataset.url = url;
// 		webview.setAttribute('preload', '../preload.js');
// 		webview.setAttribute('allowpopups', true);
// 		webview.setAttribute('disablewebsecurity', true);
// 		webview.setAttribute('webpreferences', Object.entries({
// 			webSecurity: false,
// 		}).map(([key, value]) => `${ key }=${ value ? 'on' : 'off' }`).join(' '));

// 		webview.addEventListener('dom-ready', handleDomReady.bind(null, url, webview));
// 		webview.addEventListener('focus', handleFocus.bind(null, webview));
// 		webview.addEventListener('blur', handleBlur.bind(null, webview));

// 		isAllReady = false;

// 		root.appendChild(webview);
// 		webview.setAttribute('src', lastPath || url);
// 	}

// 	if (active) {
// 		webview.focus();
// 		activeWebview = webview;
// 	}
// };

// const update = () => {
// 	if (!root) {
// 		return;
// 	}

// 	const {
// 		servers,
// 		activeServerUrl,
// 	} = state;

// 	const serverUrls = servers.map(({ url }) => url);
// 	getAll()
// 		.filter((webview) => !serverUrls.includes(webview.dataset.url))
// 		.forEach((webview) => webview.remove());

// 	if (servers.length > 0) {
// 		servers.forEach((server) => renderServer({
// 			...server,
// 			active: server.url === activeServerUrl,
// 		}));
// 	} else if (!isAllReady) {
// 		isAllReady = true;
// 		events.emit('ready');
// 	}
// };

// const setState = (partialState) => {
// 	const previousState = state;
// 	state = {
// 		...state,
// 		...partialState,
// 	};
// 	update(previousState);
// };

// const handleWindowFocus = () => {
// 	const active = getWebview({ active: true });
// 	active && active.focus();
// };

// let disconnect;

const mount = () => {
	root = document.querySelector('.Webviews');
	// window.addEventListener('focus', handleWindowFocus);
	// disconnect = connect(({
	// 	preferences: {
	// 		hasSidebar,
	// 	},
	// 	servers,
	// 	view,
	// }) => ({
	// 	servers,
	// 	activeServerUrl: view.url,
	// 	hasSpacingForTitleBarButtons: !hasSidebar,
	// }))(setState);
};

const unmount = () => {
	// disconnect();
	events.removeAllListeners();
};

export const webviews = Object.assign(events, {
	mount,
	unmount,
	goBack,
	goForward,
	resetZoom,
	zoomIn,
	zoomOut,
	getWebContents,
});
