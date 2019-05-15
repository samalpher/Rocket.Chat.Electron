import createDebugLogger from 'debug';
import { store } from '../store';
import {
	loadPreferences,
	loadServers,
	loadView,
} from '../store/actions';
import { normalizeServerUrl } from '../utils';
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

export const migrateDataFromLocalStorage = async () => {
	let { preferences, servers, view } = store.getState();

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

	store.dispatch(loadPreferences(preferences));
	store.dispatch(loadServers(servers));
	store.dispatch(loadView(view));
};
