import debug from 'debug';
import { store } from '../store';
import {
	preferencesLoaded,
	serversLoaded,
	viewLoaded,
} from '../store/actions';
import { normalizeServerUrl } from '../utils';


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
		debug('rc:data')('hideTray');
		preferences = {
			...preferences,
			hasTray: localStorage.getItem('hideTray') !== 'true',
		};
		localStorage.removeItem('hideTray');
	}

	if (localStorage.getItem('autohideMenu')) {
		debug('rc:data')('autohideMenu');
		preferences = {
			...preferences,
			hasMenus: localStorage.getItem('autohideMenu') !== 'true',
		};
		localStorage.removeItem('autohideMenu');
	}

	if (localStorage.getItem('sidebar-closed')) {
		debug('rc:data')('sidebar-closed');
		preferences = {
			...preferences,
			hasSidebar: localStorage.getItem('sidebar-closed') !== 'true',
		};
		localStorage.removeItem('sidebar-closed');
	}

	if (localStorage.getItem('showWindowOnUnreadChanged')) {
		debug('rc:data')('showWindowOnUnreadChanged');
		preferences = {
			...preferences,
			showWindowOnUnreadChanged: localStorage.getItem('showWindowOnUnreadChanged') === 'true',
		};
		localStorage.removeItem('showWindowOnUnreadChanged');
	}

	if (localStorage.getItem('spellcheckerDictionaries')) {
		debug('rc:data')('spellcheckerDictionaries');
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
		debug('rc:data')('rocket.chat.hosts, rocket.chat.sortOrder');
		const sorting = parseServerSorting(localStorage.getItem('rocket.chat.sortOrder'));
		servers = (
			parseServers(localStorage.getItem('rocket.chat.hosts'))
				.sort(({ url: a }, { url: b }) => sorting.indexOf(a) - sorting.indexOf(b))
		);
		localStorage.removeItem('rocket.chat.hosts');
		localStorage.removeItem('rocket.chat.sortOrder');
	}

	if (localStorage.getItem('rocket.chat.currentHost')) {
		debug('rc:data')('rocket.chat.currentHost');
		try {
			const value = localStorage.getItem('rocket.chat.currentHost');
			const hasActiveServer = (!value || value === 'null');
			view = hasActiveServer ? 'landing' : { url: normalizeServerUrl(value) };
		} finally {
			localStorage.removeItem('rocket.chat.currentHost');
		}
	}

	store.dispatch(preferencesLoaded(preferences));
	store.dispatch(serversLoaded(servers));
	store.dispatch(viewLoaded(view));
};
