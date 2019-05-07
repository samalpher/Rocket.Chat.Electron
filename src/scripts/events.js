import { remote } from 'electron';
import i18n from '../i18n';
import { aboutModal } from './aboutModal';
import { screenshareModal } from './screenshareModal';
import { updateModal } from './updateModal';
import { servers } from './servers';
import { sidebar } from './sidebar';
import { webviews } from './webviews';
const { app, dialog, getCurrentWindow, shell } = remote;
const {
	basicAuth,
	certificates,
	deepLinks,
	dock,
	menus,
	relaunch,
	touchBar,
	tray,
	updates,
} = remote.require('./main');


let badges = {};
let styles = {};

const setLoadingVisible = (visible) => {
	document.querySelector('.app-page').classList[visible ? 'add' : 'remove']('app-page--loading');
};

const setLandingVisible = (visible) => {
	document.querySelector('.landing-page').classList[visible ? 'remove' : 'add']('hide');
};

const updatePreferences = () => {
	const showWindowOnUnreadChanged = localStorage.getItem('showWindowOnUnreadChanged') === 'true';
	const hasTrayIcon = localStorage.getItem('hideTray') ?
		localStorage.getItem('hideTray') !== 'true' : (process.platform !== 'linux');
	const hasMenuBar = localStorage.getItem('autohideMenu') !== 'true';
	const hasSidebar = localStorage.getItem('sidebar-closed') !== 'true';

	menus.setState({
		showTrayIcon: hasTrayIcon,
		showWindowOnUnreadChanged,
		showMenuBar: hasMenuBar,
		showServerList: hasSidebar,
	});

	tray.setState({
		showIcon: hasTrayIcon,
	});

	dock.setState({
		hasTrayIcon,
	});

	sidebar.setState({
		visible: hasSidebar,
	});

	webviews.setSidebarPaddingEnabled(!hasSidebar);

	getCurrentWindow().hasTrayIcon = hasTrayIcon;
};


const updateServers = () => {
	const sorting = JSON.parse(localStorage.getItem('rocket.chat.sortOrder')) || [];
	const sortedServers = (
		Object.values(servers.getAll())
			.sort(({ url: a }, { url: b }) => sorting.indexOf(a) - sorting.indexOf(b))
	);
	const activeServerUrl = servers.getActive();

	menus.setState({
		servers: sortedServers,
		activeServerUrl,
	});

	sidebar.setState({
		servers: sortedServers,
		activeServerUrl,
	});

	touchBar.setState({
		servers: sortedServers,
		activeServerUrl,
	});
};

const updateWindowState = () => tray.setState({ isMainWindowVisible: getCurrentWindow().isVisible() });


const askWhenToInstallUpdate = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		type: 'question',
		title: i18n.__('dialog.updateReady.title'),
		message: i18n.__('dialog.updateReady.message'),
		buttons: [
			i18n.__('dialog.updateReady.installLater'),
			i18n.__('dialog.updateReady.installNow'),
		],
		defaultId: 1,
		cancelId: 0,
	}, (response) => resolve(response === 0 ? 'later' : 'now'));
});


const warnDelayedUpdateInstall = () => new Promise ((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		type: 'info',
		title: i18n.__('dialog.updateInstallLater.title'),
		message: i18n.__('dialog.updateInstallLater.message'),
		buttons: [i18n.__('dialog.updateInstallLater.ok')],
		defaultId: 0,
	}, () => resolve());
});


const warnCertificateError = ({ requestUrl, error, certificate: { issuerName }, replace }) => new Promise((resolve) => {
	const detail = `URL: ${ requestUrl }\nError: ${ error }`;

	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.certificateError.title'),
		message: i18n.__('dialog.certificateError.message', { issuerName }),
		detail: replace ? i18n.__('error.differentCertificate', { detail }) : detail,
		type: 'warning',
		buttons: [
			i18n.__('dialog.certificateError.yes'),
			i18n.__('dialog.certificateError.no'),
		],
		defaultId: 1,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});


const confirmServerAddition = ({ hostUrl }) => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.addServer.title'),
		message: i18n.__('dialog.addServer.message', { host: hostUrl }),
		type: 'question',
		buttons: [
			i18n.__('dialog.addServer.add'),
			i18n.__('dialog.addServer.cancel'),
		],
		defaultId: 0,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});


const confirmAppDataReset = () => new Promise((resolve) => {
	dialog.showMessageBox({
		title: i18n.__('dialog.resetAppData.title'),
		message: i18n.__('dialog.resetAppData.message'),
		type: 'question',
		buttons: [
			i18n.__('dialog.resetAppData.yes'),
			i18n.__('dialog.resetAppData.cancel'),
		],
		defaultId: 1,
		cancelId: 1,
	}, (response) => resolve(response === 0));
});


const destroyAll = () => {
	try {
		menus.unmount();
		tray.unmount();
		dock.unmount();
		updates.removeAllListeners();
		getCurrentWindow().removeAllListeners();
	} catch (error) {
		remote.getGlobal('console').error(error.stack || error);
	}
};

export default () => {
	window.addEventListener('beforeunload', destroyAll);
	window.addEventListener('focus', () => webviews.focusActive());

	aboutModal.on('check-for-updates', () => updates.checkForUpdates());
	aboutModal.on('set-check-for-updates-on-start', (checked) => updates.setAutoUpdate(checked));

	basicAuth.on('login-requested', ({ request: { url }, callback }) => {
		const { username, password } = servers.fromUrl(url) || {};
		callback((username && password) ? [username, password] : null);
	});

	certificates.on('ask-for-trust', async ({ requestUrl, error, certificate, replace, callback }) => {
		const isTrusted = await warnCertificateError({ requestUrl, error, certificate, replace });
		callback(isTrusted);
	});

	deepLinks.on('auth', async ({ hostUrl: serverUrl }) => {
		getCurrentWindow().forceFocus();

		if (servers.has(serverUrl)) {
			servers.setActive(serverUrl);
			return;
		}

		const shouldAdd = await confirmServerAddition({ hostUrl: serverUrl });
		if (!shouldAdd) {
			return;
		}

		try {
			await servers.validate(serverUrl);
			servers.add(serverUrl);
			servers.setActive(serverUrl);
		} catch (error) {
			dialog.showErrorBox(
				i18n.__('dialog.addServerError.title'),
				i18n.__('dialog.addServerError.message', { host: serverUrl })
			);
		}
	});

	menus.on('quit', () => app.quit());
	menus.on('about', () => aboutModal.setState({ visible: true }));
	menus.on('open-url', (url) => shell.openExternal(url));

	menus.on('add-new-server', () => {
		getCurrentWindow().show();
		servers.setActive(null);
		setLoadingVisible(false);
		setLandingVisible(true);
	});

	menus.on('select-server', ({ url }) => {
		getCurrentWindow().show();
		servers.setActive(url);
	});

	menus.on('reload-server', ({ ignoringCache = false, clearCertificates = false } = {}) => {
		if (clearCertificates) {
			certificates.clear();
		}

		const activeWebview = webviews.getActive();
		if (!activeWebview) {
			return;
		}

		if (ignoringCache) {
			activeWebview.reloadIgnoringCache();
			return;
		}

		activeWebview.reload();
	});

	menus.on('open-devtools-for-server', () => {
		const activeWebview = webviews.getActive();
		if (activeWebview) {
			activeWebview.openDevTools();
		}
	});

	menus.on('go-back', () => webviews.goBack());
	menus.on('go-forward', () => webviews.goForward());

	menus.on('reload-app', () => getCurrentWindow().reload());

	menus.on('toggle-devtools', () => getCurrentWindow().toggleDevTools());

	menus.on('reset-app-data', async () => {
		const shouldReset = await confirmAppDataReset();

		if (shouldReset) {
			relaunch('--reset-app-data');
		}
	});

	menus.on('toggle', (property) => {
		switch (property) {
			case 'showTrayIcon': {
				const previousValue = localStorage.getItem('hideTray') !== 'true';
				const newValue = !previousValue;
				localStorage.setItem('hideTray', JSON.stringify(!newValue));
				break;
			}

			case 'showWindowOnUnreadChanged': {
				const previousValue = localStorage.getItem('showWindowOnUnreadChanged') === 'true';
				const newValue = !previousValue;
				localStorage.setItem('showWindowOnUnreadChanged', JSON.stringify(newValue));
				break;
			}

			case 'showMenuBar': {
				const previousValue = localStorage.getItem('autohideMenu') !== 'true';
				const newValue = !previousValue;
				localStorage.setItem('autohideMenu', JSON.stringify(!newValue));
				break;
			}

			case 'showServerList': {
				const previousValue = localStorage.getItem('sidebar-closed') !== 'true';
				const newValue = !previousValue;
				localStorage.setItem('sidebar-closed', JSON.stringify(!newValue));
				break;
			}
		}

		updatePreferences();
	});

	screenshareModal.on('select-source', ({ id, url }) => {
		screenshareModal.setState({ visible: false });
		const webviewObj = webviews.get(url);
		webviewObj.executeJavaScript(`window.parent.postMessage({ sourceId: '${ id }' }, '*');`);
	});

	servers.on('loaded', (entries, fromDefaults) => {
		if (fromDefaults) {
			if (Object.keys(entries).length === 1) {
				localStorage.setItem('sidebar-closed', JSON.stringify(true));
			}
		}
		Object.values(entries).forEach((server) => webviews.add(server));
		setLoadingVisible(false);
		updateServers();
	});

	servers.on('added', (entry) => {
		webviews.add(entry);
		updateServers();
	});

	servers.on('removed', (entry) => {
		webviews.remove(entry);
		servers.setActive(null);
		setLoadingVisible(false);
		setLandingVisible(true);
		updateServers();
		delete badges[entry.url];
		delete styles[entry.url];
	});

	servers.on('active-setted', ({ url }) => {
		webviews.setActive(url);
		setLandingVisible(false);
		updateServers();
	});

	servers.on('active-cleared', () => {
		webviews.deactiveAll();
		setLandingVisible(true);
		updateServers();
	});

	servers.on('title-setted', () => {
		updateServers();
	});

	sidebar.on('select-server', (serverUrl) => {
		servers.setActive(serverUrl);
	});

	sidebar.on('reload-server', (serverUrl) => {
		webviews.get(serverUrl).reload();
	});

	sidebar.on('remove-server', (serverUrl) => {
		servers.remove(serverUrl);
	});

	sidebar.on('open-devtools-for-server', (hostUrl) => {
		webviews.get(hostUrl).openDevTools();
	});

	sidebar.on('add-server', () => {
		servers.setActive(null);
		setLoadingVisible(false);
		setLandingVisible(true);
	});

	sidebar.on('servers-sorted', (sorting) => {
		localStorage.setItem('rocket.chat.sortOrder', JSON.stringify(sorting));
		updateServers();
	});

	getCurrentWindow().on('hide', updateWindowState);
	getCurrentWindow().on('show', updateWindowState);

	touchBar.on('format', (buttonId) => {
		const legacyButtonIconClass = {
			bold: 'bold',
			italic: 'italic',
			strike: 'strike',
			inline_code: 'code',
			multi_line: 'multi-line',
		}[buttonId];

		webviews.getActive().executeJavaScript(`((buttonId, legacyButtonIconClass) => {
			let button = document.querySelector(\`.js-format[data-id="${ buttonId }"]\`);
			if (!button) {
				const svg = document.querySelector(\`.js-md svg[class$="${ legacyButtonIconClass }"]\`);
				button = svg && svg.parentNode;
			}
			button && button.click();
		})('${ legacyButtonIconClass }', '${ buttonId }')`);
	});

	touchBar.on('select-server', (serverUrl) => {
		servers.setActive(serverUrl);
	});

	tray.on('set-main-window-visibility', (visible) =>
		(visible ? getCurrentWindow().show() : getCurrentWindow().hide()));
	tray.on('quit', () => app.quit());

	updateModal.on('skip', (newVersion) => {
		dialog.showMessageBox(getCurrentWindow(), {
			type: 'warning',
			title: i18n.__('dialog.updateSkip.title'),
			message: i18n.__('dialog.updateSkip.message'),
			buttons: [i18n.__('dialog.updateSkip.ok')],
			defaultId: 0,
		}, () => {
			updates.skipVersion(newVersion);
			updateModal.setState({ visible: false });
		});
	});
	updateModal.on('remind-later', () => {
		updateModal.setState({ visible: false });
	});
	updateModal.on('install', () => {
		dialog.showMessageBox(getCurrentWindow(), {
			type: 'info',
			title: i18n.__('dialog.updateDownloading.title'),
			message: i18n.__('dialog.updateDownloading.message'),
			buttons: [i18n.__('dialog.updateDownloading.ok')],
			defaultId: 0,
		}, () => {
			updates.downloadUpdate();
			updateModal.setState({ visible: false });
		});
	});

	updates.on('configuration-set', ({ canUpdate, canAutoUpdate, canSetAutoUpdate }) => {
		aboutModal.setState({ canUpdate, canAutoUpdate, canSetAutoUpdate });
	});
	updates.on('error', () => aboutModal.showUpdateError());
	updates.on('checking-for-update', () => aboutModal.setState({ checking: true }));
	updates.on('update-available', ({ version }) => {
		aboutModal.setState({
			visible: false,
			checking: false,
			checkingMessage: null,
		});
		updateModal.setState({
			visible: true,
			newVersion: version,
		});
	});
	updates.on('update-not-available', () => aboutModal.showNoUpdateAvailable());
	// updates.on('download-progress', ({ bytesPerSecond, percent, total, transferred }) => console.log(percent));
	updates.on('update-downloaded', async () => {
		const whenInstall = await askWhenToInstallUpdate();

		if (whenInstall === 'later') {
			await warnDelayedUpdateInstall();
			return;
		}

		destroyAll();
		updates.quitAndInstall();
	});

	webviews.on('ipc-message-unread-changed', ({ url: serverUrl }, badge) => {
		if (typeof badge === 'number' && localStorage.getItem('showWindowOnUnreadChanged') === 'true') {
			const mainWindow = remote.getCurrentWindow();
			mainWindow.showInactive();
		}

		badges = {
			...badges,
			[serverUrl]: badge || null,
		};

		sidebar.setState({ badges });

		const mentionCount = Object.values(badges)
			.filter((badge) => Number.isInteger(badge))
			.reduce((sum, count) => sum + count, 0);
		const globalBadge = mentionCount || (Object.values(badges).some((badge) => !!badge) && '•') || null;

		tray.setState({ badge: globalBadge });
		dock.setState({ badge: globalBadge });
	});

	webviews.on('ipc-message-title-changed', ({ url: serverUrl }, title) => {
		servers.setTitle(serverUrl, title);
	});

	webviews.on('ipc-message-focus', ({ url: serverUrl }) => {
		servers.setActive(serverUrl);
	});

	webviews.on('ipc-message-sidebar-style', ({ url: serverUrl }, style) => {
		styles = {
			...styles,
			[serverUrl]: style || null,
		};

		sidebar.setState({ styles });
	});

	webviews.on('ipc-message-get-sourceId', ({ url: serverUrl }) => {
		screenshareModal.setState({ visible: false, url: serverUrl });
	});

	webviews.on('ipc-message-reload-server', ({ url: serverUrl }) => {
		webviews.get(serverUrl).loadURL(serverUrl);
	});

	webviews.on('dom-ready', () => {
		const hasSidebar = localStorage.getItem('sidebar-closed') !== 'true';
		sidebar.setState({
			visible: hasSidebar,
		});
		webviews.setSidebarPaddingEnabled(!hasSidebar);
	});

	webviews.on('did-navigate', ({ serverUrl, url }) => {
		servers.setLastPath(serverUrl, url);
	});

	sidebar.mount();
	webviews.mount();
	touchBar.mount();
	aboutModal.mount();
	screenshareModal.mount();
	updateModal.mount();

	servers.initialize();

	updatePreferences();
	updateServers();
	updateWindowState();
};
