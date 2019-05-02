import { remote } from 'electron';
import i18n from '../i18n';
import { aboutModal } from './aboutModal';
import { screenshareModal } from './screenshareModal';
import { updateModal } from './updateModal';
import servers from './servers';
import sidebar from './sidebar';
import webview from './webview';
import setTouchBar from './touchBar';
const { app, dialog, getCurrentWindow, shell } = remote;
const { certificate, dock, menus, tray, updates } = remote.require('./main');

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

	webview.setSidebarPaddingEnabled(!hasSidebar);

	getCurrentWindow().emit('set-state', { hideOnClose: hasTrayIcon });
};


const updateServers = () => {
	const sorting = JSON.parse(localStorage.getItem('rocket.chat.sortOrder')) || [];

	menus.setState({
		servers: Object.values(servers.hosts)
			.sort(({ url: a }, { url: b }) => (sidebar ? (sorting.indexOf(a) - sorting.indexOf(b)) : 0))
			.map(({ title, url }) => ({ title, url })),
		currentServerUrl: servers.active,
	});

	sidebar.setState({
		hosts: servers.hosts,
		sorting,
		active: servers.active,
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
	let badges = {};
	let styles = {};

	window.addEventListener('beforeunload', destroyAll);
	window.addEventListener('focus', () => webview.focusActive());

	aboutModal.on('check-for-updates', () => updates.checkForUpdates());
	aboutModal.on('set-check-for-updates-on-start', (checked) => updates.setAutoUpdate(checked));

	menus.on('quit', () => app.quit());
	menus.on('about', () => aboutModal.setState({ visible: true }));
	menus.on('open-url', (url) => shell.openExternal(url));

	menus.on('add-new-server', () => {
		getCurrentWindow().show();
		servers.clearActive();
		webview.showLanding();
	});

	menus.on('select-server', ({ url }) => {
		getCurrentWindow().show();
		servers.setActive(url);
	});

	menus.on('reload-server', ({ ignoringCache = false, clearCertificates = false } = {}) => {
		if (clearCertificates) {
			certificate.clear();
		}

		const activeWebview = webview.getActive();
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
		const activeWebview = webview.getActive();
		if (activeWebview) {
			activeWebview.openDevTools();
		}
	});

	menus.on('go-back', () => webview.goBack());
	menus.on('go-forward', () => webview.goForward());

	menus.on('reload-app', () => getCurrentWindow().reload());

	menus.on('toggle-devtools', () => getCurrentWindow().toggleDevTools());

	menus.on('reset-app-data', () => servers.resetAppData());

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
		const webviewObj = webview.getByUrl(url);
		webviewObj.executeJavaScript(`window.parent.postMessage({ sourceId: '${ id }' }, '*');`);
	});

	servers.on('loaded', () => {
		webview.loaded();
		updateServers();
	});

	servers.on('host-added', (hostUrl) => {
		webview.add(servers.get(hostUrl));
		updateServers();
	});

	servers.on('host-removed', (hostUrl) => {
		webview.remove(hostUrl);
		servers.clearActive();
		webview.showLanding();
		updateServers();
		delete badges[hostUrl];
		delete styles[hostUrl];
	});

	servers.on('active-setted', (hostUrl) => {
		webview.setActive(hostUrl);
		updateServers();
	});

	servers.on('active-cleared', (hostUrl) => {
		webview.deactiveAll(hostUrl);
		updateServers();
	});

	servers.on('title-setted', () => {
		updateServers();
	});

	sidebar.on('select-server', (hostUrl) => {
		servers.setActive(hostUrl);
	});

	sidebar.on('reload-server', (hostUrl) => {
		webview.getByUrl(hostUrl).reload();
	});

	sidebar.on('remove-server', (hostUrl) => {
		servers.removeHost(hostUrl);
	});

	sidebar.on('open-devtools-for-server', (hostUrl) => {
		webview.getByUrl(hostUrl).openDevTools();
	});

	sidebar.on('add-server', () => {
		servers.clearActive();
		webview.showLanding();
	});

	sidebar.on('servers-sorted', (sorting) => {
		localStorage.setItem('rocket.chat.sortOrder', JSON.stringify(sorting));
		updateServers();
	});

	getCurrentWindow().on('hide', updateWindowState);
	getCurrentWindow().on('show', updateWindowState);

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

	webview.on('ipc-message-unread-changed', (hostUrl, [badge]) => {
		if (typeof unread === 'number' && localStorage.getItem('showWindowOnUnreadChanged') === 'true') {
			const mainWindow = remote.getCurrentWindow();
			if (!mainWindow.isFocused()) {
				mainWindow.once('focus', () => mainWindow.flashFrame(false));
				mainWindow.showInactive();
				mainWindow.flashFrame(true);
			}
		}

		badges = {
			...badges,
			[hostUrl]: badge || null,
		};

		sidebar.setState({ badges });

		const mentionCount = Object.values(badges)
			.filter((badge) => Number.isInteger(badge))
			.reduce((sum, count) => sum + count, 0);
		const globalBadge = mentionCount || (Object.values(badges).some((badge) => !!badge) && '•') || null;

		tray.setState({ badge: globalBadge });
		dock.setState({ badge: globalBadge });
	});

	webview.on('ipc-message-title-changed', (hostUrl, [title]) => {
		servers.setHostTitle(hostUrl, title);
	});

	webview.on('ipc-message-focus', (hostUrl) => {
		servers.setActive(hostUrl);
	});

	webview.on('ipc-message-sidebar-style', (hostUrl, [style]) => {
		styles = {
			...styles,
			[hostUrl]: style || null,
		};

		sidebar.setState({ styles });
	});

	webview.on('ipc-message-get-sourceId', (hostUrl) => {
		screenshareModal.setState({ visible: false, url: hostUrl });
	});

	webview.on('dom-ready', () => {
		const hasSidebar = localStorage.getItem('sidebar-closed') !== 'true';
		sidebar.setState({
			visible: hasSidebar,
		});
		webview.setSidebarPaddingEnabled(!hasSidebar);
	});

	if (process.platform === 'darwin') {
		setTouchBar();
	}

	servers.initialize();
	sidebar.mount();
	webview.mount();
	aboutModal.mount();
	screenshareModal.mount();
	updateModal.mount();
	servers.restoreActive();

	updatePreferences();
	updateServers();
	updateWindowState();

	updates.initialize();
};
