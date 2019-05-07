import { EventEmitter } from 'events';


let state = {
	servers: [],
	activeServerUrl: null,
	hasSidebar: true,
};
const events = new EventEmitter();

let root;

const get = (serverUrl) => root.querySelector(`.webview[data-url="${ serverUrl }"]`);

const getActive = () => root.querySelector('.webview.webview--active');

const handleDidNavigateInPage = ({ url: serverUrl }, webview, { url }) => {
	if (url.indexOf(serverUrl) === 0) {
		events.emit('did-navigate', { serverUrl, url });
	}
};

const handleConsoleMessage = ({ url: serverUrl }, webview, { level, line, message, sourceId }) => {
	const levelFormatting = {
		[-1]: 'color: #999',
		0: 'color: #666',
		1: 'color: #990',
		2: 'color: #900',
	}[level];
	const danglingFormatting = (message.match(/%c/g) || []).map(() => '');
	console.log(`%c${ serverUrl }\t%c${ message }\n${ sourceId } : ${ line }`,
		'font-weight: bold', levelFormatting, ...danglingFormatting);
};

const handleIpcMessage = (server, webview, { channel, args }) => {
	events.emit(`ipc-message-${ channel }`, server, ...args);
};

const handleDomReady = ({ url: serverUrl }, webview) => {
	webview.classList.add('webview--ready');
	events.emit('dom-ready', webview, serverUrl);
};

const handleDidFailLoad = (server, webview, { isMainFrame }) => {
	if (isMainFrame) {
		webview.loadURL(`file://${ __dirname }/loading-error.html`);
	}
};

const handleDidGetResponseDetails = (server, webview, { resourceType, httpResponseCode }) => {
	if (resourceType === 'mainFrame' && httpResponseCode >= 500) {
		webview.loadURL(`file://${ __dirname }/loading-error.html`);
	}
};

const setTitleBarButtonsPadding = (webview, hasSidebar) => {
	if (process.platform !== 'darwin') {
		return;
	}

	webview.executeJavaScript(`(() => {
		const style = document.getElementById('electronStyle') || document.createElement('style');
		style.setAttribute('id', 'electronStyle');
		style.innerHTML = \`
		.sidebar {
			padding-top: ${ hasSidebar ? '0' : '10px' };
			transition:
				padding .5s ease-in-out,
				margin .5s ease-in-out;
		}
		\`;
		document.head.appendChild(style);
	})()`);
};

const renderServer = ({ active, hasSidebar, ...server }) => {
	const { url, lastPath } = server;
	const webviewNode = root.querySelector(`.webview[data-url="${ url }"]`);
	const shouldAppend = !webviewNode;
	const isReady = webviewNode && webviewNode.classList.contains('webview--ready');

	const webview = webviewNode ? webviewNode : document.createElement('webview');

	webview.classList.add('webview');
	webview.classList.toggle('webview--active', active);

	if (shouldAppend) {
		webview.dataset.url = url;
		webview.setAttribute('preload', '../preload.js');
		webview.setAttribute('allowpopups', 'on');
		webview.setAttribute('disablewebsecurity', 'on');

		webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage.bind(null, server, webview));
		webview.addEventListener('console-message', handleConsoleMessage.bind(null, server, webview));
		webview.addEventListener('ipc-message', handleIpcMessage.bind(null, server, webview));
		webview.addEventListener('dom-ready', handleDomReady.bind(null, server, webview));
		webview.addEventListener('did-fail-load', handleDidFailLoad.bind(null, server, webview));
		webview.addEventListener('did-get-response-details', handleDidGetResponseDetails.bind(null, server, webview));

		root.appendChild(webview);
		webview.setAttribute('src', lastPath || url);
	}

	if (isReady) {
		setTitleBarButtonsPadding(webview, hasSidebar);
	} else {
		webview.addEventListener('dom-ready', setTitleBarButtonsPadding.bind(null, webview, hasSidebar));
	}

	if (active) {
		webview.blur();
		webview.focus();
	}
};

const update = () => {
	if (!root) {
		return;
	}

	const {
		servers,
		activeServerUrl,
		hasSidebar,
	} = state;

	const serverUrls = servers.map(({ url }) => url);
	Array.from(root.querySelectorAll('.webview'))
		.filter((webview) => !serverUrls.includes(webview.dataset.url))
		.forEach((webview) => webview.remove());

	servers.forEach((server) => renderServer({
		...server,
		active: activeServerUrl === server.url,
		hasSidebar,
	}));
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
	const active = getActive();
	active && active.focus();
};

const mount = () => {
	root = document.body;
	window.addEventListener('focus', handleWindowFocus);
};

export const webviews = Object.assign(events, {
	mount,
	setState,
	get,
	getActive,
});
