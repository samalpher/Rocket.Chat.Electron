import { loadJson } from './utils';
import { normalizeServerUrl } from '../utils';


let entries = {};

const initialize = async () => {
	const appEntries = await loadJson('servers.json', 'app');
	const userEntries = await loadJson('servers.json', 'user');
	entries = {
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

const get = () => entries;

const set = (newEntries) => {
	entries = newEntries;
};

const fromUrl = (url) => {
	for (const [key, entry] of Object.entries(entries)) {
		if (url.indexOf(key) === 0) {
			return entry;
		}
	}
};

export const servers = {
	initialize,
	get,
	set,
	fromUrl,
};
