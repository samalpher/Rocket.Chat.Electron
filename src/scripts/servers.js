import { remote } from 'electron';
import { EventEmitter } from 'events';
import url from 'url';
import { normalizeServerUrl } from '../utils';
const { servers: remoteServers } = remote.require('./main');


const events = new EventEmitter();

const getEntriesFromLocalStorage = () => {
	const value = localStorage.getItem('rocket.chat.hosts');

	if (typeof value !== 'string') {
		return {};
	}

	if (value.match(/^https?:\/\//)) {
		const url = normalizeServerUrl(value);
		return {
			[url]: {
				title: url,
				url,
			},
		};
	}

	try {
		const entries = JSON.parse(value);

		if (Array.isArray(entries)) {
			return (
				entries
					.filter(normalizeServerUrl)
					.reduce((entries, url) => ({
						...entries,
						[url]: {
							title: url,
							url,
						},
					}), {})
			);
		}

		if (typeof entries !== 'object') {
			return {};
		}

		return entries;
	} catch (error) {
		return {};
	}
};

const getActiveFromLocalStorage = () => {
	const value = localStorage.getItem('rocket.chat.currentHost');
	return (!value || value === 'null') ? null : normalizeServerUrl(value);
};

let entries = {};
let active = null;

const getAll = () => entries;

const get = (serverUrl) => entries[serverUrl];

const has = (serverUrl) => !!get(serverUrl);

const set = (newEntries) => {
	entries = newEntries;
	localStorage.setItem('rocket.chat.hosts', JSON.stringify(entries));
};

const upsert = (entry) => {
	set({
		...entries,
		[entry.url]: entry,
	});
};

const getActive = () => active;

const setActive = (serverUrl) => {
	active = has(serverUrl) ? serverUrl : null;

	if (!active) {
		localStorage.removeItem('rocket.chat.currentHost');
		events.emit('active-cleared');
		return;
	}

	localStorage.setItem('rocket.chat.currentHost', serverUrl);
	events.emit('active-setted', entries[active]);
};

const initialize = () => {
	let persistedEntries = getEntriesFromLocalStorage();
	let fromDefaults = false;

	if (Object.keys(persistedEntries).length === 0) {
		persistedEntries = JSON.parse(JSON.stringify(remoteServers.getDefault()));
		fromDefaults = true;
	}

	set(persistedEntries);

	events.emit('loaded', entries, fromDefaults);

	const persistedActive = getActiveFromLocalStorage();
	setActive(persistedActive);
};

const fromUrl = (url) => {
	for (const [key, entry] of Object.entries(events._hosts)) {
		if (url.indexOf(key) === 0) {
			return entry;
		}
	}
};

const add = (serverUrl) => {
	if (has(serverUrl)) {
		setActive(serverUrl);
		return;
	}

	const entry = {
		url: serverUrl,
	};

	const parsedUrl = url.parse(serverUrl);
	const { auth } = parsedUrl;
	if (auth) {
		entry.authUrl = serverUrl;
		delete parsedUrl.auth;
		entry.url = url.format(parsedUrl);
		[entry.username, entry.password] = auth.split(':');
	}

	entry.title = entry.url;

	upsert(entry);

	events.emit('added', entry);

	return serverUrl;
};

const remove = (serverUrl) => {
	const entry = entries[serverUrl];
	delete entries[serverUrl];

	if (!entry) {
		return;
	}

	set(entries);

	if (getActive() === serverUrl) {
		setActive(null);
	}

	events.emit('removed', entry);
};

const setTitle = (serverUrl, title) => {
	if (title === 'Rocket.Chat' && serverUrl.indexOf('https://open.rocket.chat') === 0) {
		title += ` - ${ serverUrl }`;
	}

	const entry = {
		...entries[serverUrl],
		title,
	};

	upsert(entry);

	events.emit('title-setted', entry);
};

const setLastPath = (serverUrl, lastPath) => {
	const server = get(serverUrl);
	upsert({
		...server,
		lastPath,
	});
};

const validate = async (serverUrl, timeout = 5000) => {
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

	if (!response.ok) {
		throw 'invalid';
	}
};

export const servers = Object.assign(events, {
	initialize,
	fromUrl,
	getActive,
	setActive,
	getAll,
	has,
	get,
	upsert,
	add,
	remove,
	setTitle,
	setLastPath,
	validate,
});
