import { loadJson } from './utils';


let entries = {};

const initialize = async () => {
	const appEntries = await loadJson('servers.json', 'app');
	const userEntries = await loadJson('servers.json', 'user');
	entries = { ...appEntries, ...userEntries };
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
