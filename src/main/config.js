import createDebugLogger from 'debug';
import ElectronStore from 'electron-store';
import { store, connect } from '../store';
import { debounce, loadJson, normalizeServerUrl } from '../utils';
import {
	preferencesLoaded,
	serversLoaded,
	viewLoaded,
	windowStateLoaded,
	setPreferences,
} from '../store/actions';


const debug = createDebugLogger('rc:data');

export let config;

const loadFromFileSystem = async (preferences, servers, view, windowState) => {
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

	if (Object.keys(windowState).length === 0) {
		const prevWindowState = await loadJson('window-state-main.json', 'user');
		const { x, y, width, height, isMinimized, isMaximized, isHidden } = prevWindowState;
		windowState = { x, y, width, height, isMinimized, isMaximized, isHidden };
	}

	return [preferences, servers, view, windowState];
};

const persist = debounce(({ preferences, servers, view, windowState }) => {
	config.set('preferences', preferences);
	config.set('servers', servers);
	config.set('view', view);
	config.set('windowState', windowState);
}, 100);

export const initializeConfiguration = async () => {
	config = new ElectronStore();

	let preferences = config.get('preferences', {});
	let servers = config.get('servers', []);
	let view = config.get('view', 'landing');
	let windowState = config.get('windowState', {});

	[preferences, servers, view, windowState] = await loadFromFileSystem(preferences, servers, view, windowState);

	store.dispatch(preferencesLoaded(preferences));
	store.dispatch(serversLoaded(servers));
	store.dispatch(viewLoaded(view));
	store.dispatch(windowStateLoaded(windowState));

	connect(({
		preferences,
		servers,
		view,
		windowState,
	}) => ({
		preferences,
		servers,
		view,
		windowState,
	}))(persist);
};

