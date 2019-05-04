import { loadJson } from './utils';
import { normalizeServerUrl } from '../utils';


let defaultServers = {};

const initialize = async () => {
	const appEntries = await loadJson('servers.json', 'app');
	const userEntries = await loadJson('servers.json', 'user');
	defaultServers = {
		...(
			Object.entries(appEntries)
				.map(([title, url]) => [title, normalizeServerUrl(url)])
				.reduce((entries, [title, url]) => ({ ...entries, [url]: { title, url } }), {})
		),
		...(
			Object.entries(userEntries)
				.map(([title, url]) => [title, normalizeServerUrl(url)])
				.reduce((entries, [title, url]) => ({ ...entries, [url]: { title, url } }), {})
		),
	};
};

const getDefault = () => defaultServers;

export const servers = {
	initialize,
	getDefault,
};
