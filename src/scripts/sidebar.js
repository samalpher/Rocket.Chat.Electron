import { remote } from 'electron';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { connect } from '../store';
import { parse as parseUrl } from 'url';
const { getCurrentWindow, Menu } = remote;


const faviconCacheBustingTime = 15 * 60 * 1000;

let state = {
	servers: [],
	activeServerUrl: false,
	showShortcuts: false,
	visible: false,
};

let root;
let serverList;

const events = new EventEmitter();

const handleServerClick = (url) => {
	events.emit('select-server', url);
};

const handleServerContextMenu = (url, event) => {
	event.preventDefault();

	const menu = Menu.buildFromTemplate([
		{
			label: i18n.__('sidebar.item.reload'),
			click: () => events.emit('reload-server', url),
		},
		{
			label: i18n.__('sidebar.item.remove'),
			click: () => events.emit('remove-server', url),
		},
		{
			label: i18n.__('sidebar.item.openDevTools'),
			click: () => events.emit('open-devtools-for-server', url),
		},
	]);
	menu.popup(getCurrentWindow());
};

const handleDragStart = (event) => {
	const serverElement = event.currentTarget;
	serverElement.classList.add('server--dragged');

	event.dataTransfer.dropEffect = 'move';
	event.dataTransfer.effectAllowed = 'move';
};

const handleDragEnd = (event) => {
	const serverElement = event.currentTarget;
	serverElement.classList.remove('server--dragged');
};

const handleDragEnter = (event) => {
	const draggedServerElement = serverList.querySelector('.server--dragged');
	const targetServerElement = event.currentTarget;

	const isTargetBeforeDragged = (() => {
		for (let current = draggedServerElement; current; current = current.previousSibling) {
			if (current === targetServerElement) {
				return true;
			}
		}

		return false;
	})();

	if (isTargetBeforeDragged) {
		serverList.insertBefore(draggedServerElement, targetServerElement);
	} else if (targetServerElement !== serverList.lastChild) {
		serverList.insertBefore(draggedServerElement, targetServerElement.nextSibling);
	} else {
		serverList.appendChild(draggedServerElement);
	}
};

const handleDragOver = (event) => {
	event.preventDefault();
};

const handleDrop = (event) => {
	event.preventDefault();

	const serverElement = event.currentTarget;

	const newSorting = Array.from(serverList.querySelectorAll('.server'))
		.map((serverElement) => serverElement.dataset.url);

	events.emit('servers-sorted', newSorting);
	events.emit('select-server', serverElement.dataset.url);
};

const renderServer = ({ url, title = url, order, active, badge }) => {
	const hasUnreadMessages = !!badge;
	const mentionCount = (badge || badge === 0) ? parseInt(badge, 10) : null;
	const initials = (
		title
			.replace(url, parseUrl(url).hostname)
			.split(/[^A-Za-z0-9]+/g)
			.slice(0, 2)
			.map((text) => text.slice(0, 1).toUpperCase())
			.join('')
	);
	const bustingParam = Math.round(Date.now() / faviconCacheBustingTime);
	const faviconUrl = `${ url.replace(/\/$/, '') }/assets/favicon.svg?_=${ bustingParam }`;

	const serverNode = root.querySelector(`.server[data-url="${ url }"]`);
	const serverElement = serverNode ? serverNode : document.createElement('li');
	const initialsElement = serverNode ? serverNode.querySelector('.server__initials') : document.createElement('span');
	const faviconElement = serverNode ? serverNode.querySelector('.server__favicon') : document.createElement('img');
	const badgeElement = serverNode ? serverNode.querySelector('.server__badge') : document.createElement('div');
	const shortcutElement = serverNode ? serverNode.querySelector('.server__shortcut') : document.createElement('div');

	serverElement.setAttribute('draggable', 'true');
	serverElement.dataset.url = url;
	serverElement.dataset.tooltip = (
		(url !== 'https://open.rocket.chat' && title === 'Rocket.Chat') ? `${ title } - ${ url }` : title
	);
	serverElement.classList.add('sidebar__list-item');
	serverElement.classList.add('server');
	serverElement.classList.toggle('server--active', active);
	serverElement.classList.toggle('server--unread', hasUnreadMessages);
	serverElement.onclick = handleServerClick.bind(null, url);
	serverElement.oncontextmenu = handleServerContextMenu.bind(null, url);
	serverElement.ondragstart = handleDragStart;
	serverElement.ondragend = handleDragEnd;
	serverElement.ondragenter = handleDragEnter;
	serverElement.ondragover = handleDragOver;
	serverElement.ondrop = handleDrop;

	initialsElement.classList.add('server__initials');
	initialsElement.innerText = initials;

	faviconElement.setAttribute('draggable', 'false');
	faviconElement.classList.add('server__favicon');
	faviconElement.onload = () => {
		serverElement.classList.add('server--with-favicon');
	};
	faviconElement.onerror = () => {
		serverElement.classList.remove('server--with-favicon');
	};
	faviconElement.src = faviconUrl;

	badgeElement.classList.add('server__badge');
	badgeElement.innerText = Number.isInteger(mentionCount) ? String(mentionCount) : '',

	shortcutElement.classList.add('server__shortcut');
	shortcutElement.innerText = `${ process.platform === 'darwin' ? '⌘' : '^' }${ order + 1 }`;

	if (!serverNode) {
		serverElement.appendChild(initialsElement);
		serverElement.appendChild(faviconElement);
		serverElement.appendChild(badgeElement);
		serverElement.appendChild(shortcutElement);
	}

	const shouldAppend = !serverNode || order !== Array.from(serverList.children).indexOf(serverElement);

	if (shouldAppend) {
		serverList.appendChild(serverElement);
	}
};

const update = () => {
	if (!root) {
		return;
	}

	const {
		servers,
		activeServerUrl,
		showShortcuts,
		visible,
	} = state;

	root.classList.toggle('sidebar--hidden', !visible);
	serverList.classList.toggle('sidebar__server-list--shortcuts', showShortcuts);

	const style = servers.filter(({ url }) => activeServerUrl === url).map(({ style }) => style)[0] || {};
	root.style.setProperty('--background', style.background || '');
	root.style.setProperty('--color', style.color || '');

	const serverUrls = servers.map(({ url }) => url);
	Array.from(serverList.querySelectorAll('.server'))
		.filter((serverElement) => !serverUrls.includes(serverElement.dataset.url))
		.forEach((serverElement) => serverElement.remove());

	servers.forEach((server, order) => renderServer({ ...server, active: server.url === activeServerUrl, order }));
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

const handleShortcutsKey = (down, event) => {
	const shortcutKey = process.platform === 'darwin' ? 'Meta' : 'Control';
	if (event.key === shortcutKey) {
		setState({ showShortcuts: down });
	}
};

const handleAddServerClick = () => {
	events.emit('add-server');
};

let disconnect;

const mount = () => {
	root = document.querySelector('.sidebar');
	root.classList.toggle('sidebar--macos', process.platform === 'darwin');

	// TODO: use globalShortcut and mainWindow focus
	window.addEventListener('keydown', handleShortcutsKey.bind(null, true));
	window.addEventListener('keyup', handleShortcutsKey.bind(null, false));

	root.querySelector('.sidebar__add-server').dataset.tooltip = i18n.__('sidebar.addNewServer');

	root.querySelector('.sidebar__add-server').addEventListener('click', handleAddServerClick, false);

	serverList = root.querySelector('.sidebar__server-list');

	update();
	disconnect = connect(({
		loading,
		preferences: {
			hasSidebar,
		},
		servers,
		view,
	}) => ({
		servers,
		activeServerUrl: view.url,
		visible: !loading && hasSidebar,
	}))(setState);
};

const unmount = () => {
	disconnect();
	events.removeAllListeners();
};

export const sidebar = Object.assign(events, {
	mount,
	unmount,
});
