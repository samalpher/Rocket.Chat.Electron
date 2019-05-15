import createDebugLogger from 'debug';
import { remote } from 'electron';
import { store } from '../store';
import {
	loadPreferences,
	loadServers,
	loadView,
	setPreferences,
} from '../store/actions';
import {
	debounce,
	loadJson,
	normalizeServerUrl,
} from '../utils';
const { config } = remote.require('./main');
const debug = createDebugLogger('rc:data');


const parseServers = (value) => {
	if (typeof value !== 'string') {
		return [];
	}

	if (value.match(/^https?:\/\//)) {
		const url = normalizeServerUrl(value);
		return [{ url, title: url }];
	}

	try {
		const parsedEntries = JSON.parse(value);

		if (Array.isArray(parsedEntries)) {
			return (
				parsedEntries
					.map(normalizeServerUrl)
					.map((url) => ({ url, title: url }))
			);
		}

		if (typeof parsedEntries !== 'object') {
			return [];
		}

		return (
			Object.values(parsedEntries)
				.map(({ url, ...props }) => ({ url, ...props }))
		);
	} catch (error) {
		return [];
	}
};

const parseServerSorting = (value) => {
	try {
		return JSON.parse(value) || [];
	} catch (error) {
		return [];
	}
};

const migrateFromLocalStorage = (preferences, servers, view) => {
	if (localStorage.getItem('hideTray')) {
		debug('hideTray');
		preferences = {
			...preferences,
			hasTray: localStorage.getItem('hideTray') !== 'true',
		};
		localStorage.removeItem('hideTray');
	}

	if (localStorage.getItem('autohideMenu')) {
		debug('autohideMenu');
		preferences = {
			...preferences,
			hasMenus: localStorage.getItem('autohideMenu') !== 'true',
		};
		localStorage.removeItem('autohideMenu');
	}

	if (localStorage.getItem('sidebar-closed')) {
		debug('sidebar-closed');
		preferences = {
			...preferences,
			hasSidebar: localStorage.getItem('sidebar-closed') !== 'true',
		};
		localStorage.removeItem('sidebar-closed');
	}

	if (localStorage.getItem('showWindowOnUnreadChanged')) {
		debug('showWindowOnUnreadChanged');
		preferences = {
			...preferences,
			showWindowOnUnreadChanged: localStorage.getItem('showWindowOnUnreadChanged') === 'true',
		};
		localStorage.removeItem('showWindowOnUnreadChanged');
	}

	if (localStorage.getItem('spellcheckerDictionaries')) {
		debug('spellcheckerDictionaries');
		try {
			const dictionaries = JSON.parse(localStorage.getItem('spellcheckerDictionaries'));
			preferences = {
				...preferences,
				enabledDictionaries: Array.isArray(dictionaries) ? dictionaries.map(String) : [],
			};
		} finally {
			localStorage.removeItem('spellcheckerDictionaries');
		}
	}

	if (localStorage.getItem('rocket.chat.hosts') || localStorage.getItem('rocket.chat.sortOrder')) {
		debug('rocket.chat.hosts, rocket.chat.sortOrder');
		const sorting = parseServerSorting(localStorage.getItem('rocket.chat.sortOrder'));
		servers = (
			parseServers(localStorage.getItem('rocket.chat.hosts'))
				.sort(({ url: a }, { url: b }) => sorting.indexOf(a) - sorting.indexOf(b))
		);
		localStorage.removeItem('rocket.chat.hosts');
		localStorage.removeItem('rocket.chat.sortOrder');
	}

	if (localStorage.getItem('rocket.chat.currentHost')) {
		debug('rocket.chat.currentHost');
		try {
			const value = localStorage.getItem('rocket.chat.currentHost');
			const hasActiveServer = (!value || value === 'null');
			view = hasActiveServer ? 'landing' : { url: normalizeServerUrl(value) };
		} finally {
			localStorage.removeItem('rocket.chat.currentHost');
		}
	}

	return [preferences, servers, view];
};

const loadFromFileSystem = async (preferences, servers, view) => {
	if (servers.length === 0) {
		debug('servers.json');
		const appEntries = await loadJson('servers.json', 'app');
		const userEntries = await loadJson('servers.json', 'user');
		servers = [
			...(
				Object.entries(appEntries)
					.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
			),
			...(
				Object.entries(userEntries)
					.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
			),
		];
		view = servers[0] ? { url: servers[0].url } : 'landing';

		if (servers.length <= 1) {
			store.dispatch(setPreferences({ hasSidebar: false }));
		}
	}

	return [preferences, servers, view];
};

const persist = debounce(() => {
	const {
		preferences,
		servers,
		view,
	} = store.getState();

	config.set('preferences', preferences);
	config.set('servers', servers);
	config.set('view', view);
}, 1000);

export const initializeData = async () => {
	let preferences = config.get('preferences', {});
	let servers = config.get('servers', []);
	let view = config.get('view', 'landing');

	[preferences, servers, view] = migrateFromLocalStorage(preferences, servers, view);
	[preferences, servers, view] = await loadFromFileSystem(preferences, servers, view);

	store.dispatch(loadPreferences(preferences));
	store.dispatch(loadServers(servers));
	store.dispatch(loadView(view));

	store.subscribe(persist);
};
