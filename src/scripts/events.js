import { remote, clipboard } from 'electron';
import i18n from '../i18n';
import * as channels from '../preload/channels';
import { store } from '../store';
import {
	loadingDone,
	showLanding,
	showServer,
	setPreferences,
	toggleSpellcheckingDictionary,
	addServerFromUrl,
	removeServerFromUrl,
	sortServers,
	setServerProperties,
	historyFlagsUpdated,
	editFlagsUpdated,
	showAboutModal,
	hideModal,
	focusWindow,
} from '../store/actions';
import { queryEditFlags } from '../utils';
import { migrateDataFromLocalStorage } from './data';
import { loading } from './loading';
import { aboutModal } from './aboutModal';
import { updateModal } from './updateModal';
import { screenshareModal } from './screenshareModal';
import { contextMenu } from './contextMenu';
import { landing } from './landing';
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
	spellchecking,
	touchBar,
	tray,
	updates,
} = remote.require('./main');


const mountAll = () => {
	loading.mount();
	sidebar.mount();
	landing.mount();
	webviews.mount();
	aboutModal.mount();
	screenshareModal.mount();
	updateModal.mount();

	menus.mount();
	dock.mount();
	tray.mount();
	touchBar.mount();
};

const unmountAll = () => {
	loading.unmount();
	sidebar.unmount();
	landing.unmount();
	webviews.unmount();
	aboutModal.unmount();
	screenshareModal.unmount();
	updateModal.unmount();

	menus.unmount();
	dock.unmount();
	tray.unmount();
	touchBar.unmount();
};


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

const confirmServerAddition = ({ serverUrl }) => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.addServer.title'),
		message: i18n.__('dialog.addServer.message', { host: serverUrl }),
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

const warnItWillSkipVersion = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateSkip.title'),
		message: i18n.__('dialog.updateSkip.message'),
		type: 'warning',
		buttons: [i18n.__('dialog.updateSkip.ok')],
		defaultId: 0,
	}, () => resolve());
});

const informItWillInstallUpdate = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateDownloading.title'),
		message: i18n.__('dialog.updateDownloading.message'),
		type: 'info',
		buttons: [i18n.__('dialog.updateDownloading.ok')],
		defaultId: 0,
	}, () => resolve());
});

const destroyAll = () => {
	try {
		unmountAll();
		deepLinks.removeAllListeners();
		basicAuth.removeAllListeners();
		certificates.removeAllListeners();
		updates.removeAllListeners();
		getCurrentWindow().removeAllListeners();
	} catch (error) {
		remote.getGlobal('console').error(error.stack || error);
	}
};

const getFocusedWebContents = () => webviews.getWebContents({ focused: true }) || getCurrentWindow().webContents;

const browseForDictionary = () => {
	const callback = async (filePaths = []) => {
		try {
			await spellchecking.installDictionaries(filePaths);
		} catch (error) {
			console.error(error);
			dialog.showErrorBox(
				i18n.__('dialog.loadDictionaryError.title'),
				i18n.__('dialog.loadDictionaryError.message', { message: error.message })
			);
		}
	};

	dialog.showOpenDialog(getCurrentWindow(), {
		title: i18n.__('dialog.loadDictionary.title'),
		defaultPath: spellchecking.getDictionaryInstallationDirectory(),
		filters: [
			{ name: i18n.__('dialog.loadDictionary.dictionaries'), extensions: ['aff', 'dic'] },
			{ name: i18n.__('dialog.loadDictionary.allFiles'), extensions: ['*'] },
		],
		properties: ['openFile', 'multiSelections'],
	}, callback);
};

const getServerFromUrl = (subUrl) => {
	const { servers } = store.getState();
	return servers.find(({ url }) => subUrl.indexOf(url) === 0);
};

const validateServer = async (serverUrl, timeout = 5000) => {
	try {
		const headers = new Headers();

		if (serverUrl.includes('@')) {
			const url = new URL(serverUrl);
			serverUrl = url.origin;
			headers.set('Authorization', `Basic ${ btoa(`${ url.username }:${ url.password }`) }`);
		}
		const response = await Promise.race([
			fetch(`${ serverUrl }/api/info`, { headers }),
			new Promise((resolve, reject) => setTimeout(() => reject('timeout'), timeout)),
		]);

		if (response.status === 401) {
			return 'basic-auth';
		}

		if (!response.ok) {
			return 'invalid';
		}

		const { success } = await response.json();
		if (!success) {
			return 'invalid';
		}

		return 'valid';
	} catch (error) {
		return 'invalid';
	}
};

const addServer = async (serverUrl, askForConfirmation = false) => {
	const { servers } = store.getState();
	const index = servers.findIndex(({ url }) => url === serverUrl);

	if (index > -1) {
		store.dispatch(showServer(serverUrl));
		return;
	}

	if (askForConfirmation) {
		const shouldAdd = await confirmServerAddition({ serverUrl });
		if (!shouldAdd) {
			return;
		}
	}

	const result = await validateServer(serverUrl);
	if (result === 'valid') {
		store.dispatch(addServerFromUrl(serverUrl));
		store.dispatch(showServer(serverUrl));
	} else {
		dialog.showErrorBox(
			i18n.__('dialog.addServerError.title'),
			i18n.__('dialog.addServerError.message', { host: serverUrl })
		);
	}

	return result;
};

export default async () => {
	window.addEventListener('beforeunload', destroyAll);

	await i18n.initialize();

	document.addEventListener('selectionchange', () => {
		store.dispatch(editFlagsUpdated(queryEditFlags()));
		store.dispatch(historyFlagsUpdated({
			canGoBack: false,
			canGoForward: false,
		}));
	});

	aboutModal.on('check-for-updates', () => updates.checkForUpdates());
	aboutModal.on('set-check-for-updates-on-start', (enabled) => updates.setAutoUpdate(enabled));

	basicAuth.on('login-requested', ({ webContentsUrl, callback }) => {
		const { username, password } = getServerFromUrl(webContentsUrl) || {};
		callback((username && password) ? [username, password] : null);
	});

	certificates.on('ask-for-trust', async ({ requestUrl, error, certificate, replace, callback }) => {
		const isTrusted = await warnCertificateError({ requestUrl, error, certificate, replace });
		callback(isTrusted);
	});

	contextMenu.on('replace-misspelling', (correction) => getFocusedWebContents().replaceMisspelling(correction));
	contextMenu.on('toggle-dictionary', (dictionary, enabled) => store.dispatch(toggleSpellcheckingDictionary(dictionary, enabled)));
	contextMenu.on('browse-for-dictionary', () => browseForDictionary());
	contextMenu.on('save-image-as', (url) => getFocusedWebContents().downloadURL(url)),
	contextMenu.on('open-link', (url) => shell.openExternal(url));
	contextMenu.on('copy-link-text', ({ text }) => clipboard.write({ text, bookmark: text }));
	contextMenu.on('copy-link-address', ({ text, url }) => clipboard.write({ text: url, bookmark: text }));
	contextMenu.on('undo', () => getFocusedWebContents().undo());
	contextMenu.on('redo', () => getFocusedWebContents().redo());
	contextMenu.on('cut', () => getFocusedWebContents().cut());
	contextMenu.on('copy', () => getFocusedWebContents().copy());
	contextMenu.on('paste', () => getFocusedWebContents().paste());
	contextMenu.on('select-all', () => getFocusedWebContents().selectAll());

	deepLinks.on('auth', async ({ serverUrl }) => {
		store.dispatch(focusWindow());
		await addServer(serverUrl, true);
	});

	landing.on('add-server', async (serverUrl, callback) => {
		callback(await addServer(serverUrl));
	});

	menus.on('quit', () => app.quit());
	menus.on('about', () => store.dispatch(showAboutModal()));
	menus.on('open-url', (url) => shell.openExternal(url));

	menus.on('undo', () => getFocusedWebContents().undo());
	menus.on('redo', () => getFocusedWebContents().redo());
	menus.on('cut', () => getFocusedWebContents().cut());
	menus.on('copy', () => getFocusedWebContents().copy());
	menus.on('paste', () => getFocusedWebContents().paste());
	menus.on('select-all', () => getFocusedWebContents().selectAll());

	menus.on('reset-zoom', () => webviews.resetZoom({ active: true }));
	menus.on('zoom-in', () => webviews.zoomIn({ active: true }));
	menus.on('zoom-out', () => webviews.zoomOut({ active: true }));

	menus.on('add-new-server', () => {
		getCurrentWindow().show();
		store.dispatch(showLanding());
	});

	menus.on('select-server', ({ url }) => {
		getCurrentWindow().show();
		store.dispatch(showServer(url));
	});

	menus.on('reload-server', ({ ignoringCache = false, clearCertificates = false } = {}) => {
		if (clearCertificates) {
			certificates.clear();
		}

		webviews.reload({ active: true }, { ignoringCache });
	});

	menus.on('open-devtools-for-server', () => {
		webviews.openDevTools({ active: true });
	});

	menus.on('go-back', () => {
		webviews.goBack({ active: true });
	});

	menus.on('go-forward', () => {
		webviews.goForward({ active: true });
	});

	menus.on('reload-app', () => getCurrentWindow().reload());

	menus.on('toggle-devtools', () => getCurrentWindow().toggleDevTools());

	menus.on('reset-app-data', async () => {
		const shouldReset = await confirmAppDataReset();

		if (shouldReset) {
			relaunch('--reset-app-data');
		}
	});

	menus.on('toggle', (property, value) => {
		switch (property) {
			case 'hasTray': {
				store.dispatch(setPreferences({ hasTray: value }));
				break;
			}

			case 'hasMenus': {
				store.dispatch(setPreferences({ hasMenus: value }));
				break;
			}

			case 'hasSidebar': {
				store.dispatch(setPreferences({ hasSidebar: value }));
				break;
			}

			case 'showWindowOnUnreadChanged': {
				store.dispatch(setPreferences({ showWindowOnUnreadChanged: value }));
				break;
			}
		}
	});

	sidebar.on('select-server', (url) => {
		store.dispatch(showServer(url));
	});

	sidebar.on('reload-server', (url) => {
		webviews.reload({ url });
	});

	sidebar.on('remove-server', (url) => {
		store.dispatch(removeServerFromUrl(url));
	});

	sidebar.on('open-devtools-for-server', (url) => {
		webviews.openDevTools({ url });
	});

	sidebar.on('add-server', () => {
		store.dispatch(showLanding());
	});

	sidebar.on('servers-sorted', (urls) => {
		store.dispatch(sortServers(urls));
	});

	touchBar.on('format', (buttonId) => {
		webviews.format({ active: true }, buttonId);
	});

	touchBar.on('select-server', (url) => {
		store.dispatch(showServer(url));
	});

	tray.on('activate', (visible) =>
		(visible ? getCurrentWindow().show() : getCurrentWindow().hide()));
	tray.on('quit', () => app.quit());

	updateModal.on('skip', async (newVersion) => {
		await warnItWillSkipVersion();
		updates.skipVersion(newVersion);
		store.dispatch(hideModal());
	});
	updateModal.on('remind-later', () => {
		store.dispatch(hideModal());
	});
	updateModal.on('install', async () => {
		await informItWillInstallUpdate();
		updates.downloadUpdate();
		store.dispatch(hideModal());
	});

	updates.on('update-downloaded', async () => {
		const whenInstall = await askWhenToInstallUpdate();

		if (whenInstall === 'later') {
			await warnDelayedUpdateInstall();
			return;
		}

		destroyAll();
		updates.quitAndInstall();
	});

	webviews.on(channels.badgeChanged, (url, badge) => {
		const { preferences: { showWindowOnUnreadChanged } } = store.getState();
		if (typeof badge === 'number' && showWindowOnUnreadChanged) {
			getCurrentWindow().showInactive();
		}
	});

	webviews.on(channels.reloadServer, (url) => {
		webviews.reload({ url }, { fromUrl: true });
	});

	webviews.on(channels.triggerContextMenu, (url, params) => {
		const {
			preferences: {
				enabledDictionaries,
			},
		} = store.getState();
		const { selectionText } = params;
		const corrections = spellchecking.getCorrections(selectionText);
		const availableDictionaries = spellchecking.getAvailableDictionaries();
		const dictionaries = availableDictionaries.map((dictionary) => ({
			dictionary,
			enabled: enabledDictionaries.includes(dictionary),
		}));
		const multipleDictionaries = spellchecking.supportsMultipleDictionaries();

		contextMenu.trigger({ ...params, corrections, dictionaries, multipleDictionaries });
	});

	webviews.on('did-navigate', (url, lastPath) => {
		store.dispatch(setServerProperties({ url, lastPath }));
		store.dispatch(historyFlagsUpdated({
			canGoBack: webviews.getWebContents({ url }).canGoBack(),
			canGoForward: webviews.getWebContents({ url }).canGoForward(),
		}));
	});

	webviews.on('ready', () => {
		store.dispatch(loadingDone());
	});

	mountAll();

	await migrateDataFromLocalStorage();
};
