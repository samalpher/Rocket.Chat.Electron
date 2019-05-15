import createDebugLogger from 'debug';
import ElectronStore from 'electron-store';
import { store } from '../store';
import { debounce, loadJson, normalizeServerUrl } from '../utils';
import { loadPreferences, loadServers, loadView, setPreferences } from '../store/actions';


const debug = createDebugLogger('rc:data');

export let config;

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

const connectToStore = debounce(() => {
	const { preferences, servers, view } = store.getState();

	config.set('preferences', preferences);
	config.set('servers', servers);
	config.set('view', view);
}, 100);

export const initializeConfiguration = async () => {
	config = new ElectronStore();

	let preferences = config.get('preferences', {});
	let servers = config.get('servers', []);
	let view = config.get('view', 'landing');

	[preferences, servers, view] = await loadFromFileSystem(preferences, servers, view);

	store.dispatch(loadPreferences(preferences));
	store.dispatch(loadServers(servers));
	store.dispatch(loadView(view));

	store.subscribe(connectToStore);
};

