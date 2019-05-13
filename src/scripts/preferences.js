import { EventEmitter } from 'events';


const initialState = {
	showWindowOnUnreadChanged: false,
	hasTrayIcon: process.platform !== 'linux',
	hasMenuBar: true,
	hasSidebar: true,
	spellchecking: {
		enabledDictionaries: [navigator.language],
	},
};

let entries = initialState;

const events = new EventEmitter();

const load = () => {
	try {
		return JSON.parse(localStorage.getItem('preferences')) || initialState;
	} catch (error) {
		return initialState;
	}
};

const persist = () => localStorage.setItem('preferences', JSON.stringify(entries));

const initialize = async () => {
	entries = await load();

	if (localStorage.getItem('hideTray')) {
		entries.hasTrayIcon = localStorage.getItem('hideTray') !== 'true';
		localStorage.removeItem('hideTray');
	}

	if (localStorage.getItem('autohideMenu')) {
		entries.hasMenuBar = localStorage.getItem('autohideMenu') !== 'true';
		localStorage.removeItem('autohideMenu');
	}

	if (localStorage.getItem('sidebar-closed')) {
		entries.hasSidebar = localStorage.getItem('sidebar-closed') !== 'true';
		localStorage.removeItem('sidebar-closed');
	}

	if (localStorage.getItem('showWindowOnUnreadChanged')) {
		entries.showWindowOnUnreadChanged = localStorage.getItem('showWindowOnUnreadChanged') === 'true';
		localStorage.removeItem('showWindowOnUnreadChanged');
	}

	entries.spellchecking = entries.spellchecking || {};

	if (localStorage.getItem('spellcheckerDictionaries')) {
		try {
			const dictionaries = JSON.parse(localStorage.getItem('spellcheckerDictionaries'));
			entries.spellchecking.enabledDictionaries = Array.isArray(dictionaries) ? dictionaries.map(String) : [];
		} finally {
			localStorage.removeItem('spellcheckerDictionaries');
		}
	}

	await persist();
};

const get = (name) => entries[name];

const getAll = () => entries;

const set = async (name, value) => {
	entries[name] = value;
	await persist();
	events.emit('set', name, value);
};

export const preferences = Object.assign(events, {
	initialize,
	get,
	getAll,
	set,
});
