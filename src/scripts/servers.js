import { ipcRenderer, remote } from 'electron';
import { EventEmitter } from 'events';
import querystring from 'querystring';
import url from 'url';


class Servers extends EventEmitter {
	constructor() {
		super();

		this.items = {};
		this.active = null;

		ipcRenderer.on('add-host', this.handleAddHost.bind(this));
	}

	async handleAddHost(event, ...urls) {
		for (const server of this.parseUrls(urls)) {
			if (this.items[server.url]) {
				this.setActive(server);
				continue;
			}

			if (!await this.validate(server)) {
				this.emit('host-rejected', server);
				continue;
			}

			this.confirmNew(server);
		}
	}

	confirmNew(server) {
		this.emit('host-requested', server, (accepted) => {
			if (!accepted) {
				return;
			}

			this.items = { ...this.items, [server.url]: server };
			this.persist();
			this.emit('host-added', server);
		});
	}

	add(...urls) {
		for (const server of this.parseUrls(urls)) {
			if (this.items[server.url]) {
				return;
			}

			this.items = { ...this.items, [server.url]: server };
			this.persist();
			this.emit('host-added', server);
		}
	}

	parseUrls(urls) {
		return urls.map((ref) => {
			const parsed = url.parse(ref.replace(/\/$/, ''));

			if (parsed.protocol) {
				return parsed;
			}

			const isDomain = (ref === 'localhost' || ref.indexOf('.') > -1);
			return url.parse(isDomain ? `https://${ ref }` : `https://${ ref }.rocket.chat`);
		})
			.filter(({ protocol }) => ['rocketchat:', 'http:', 'https:'].includes(protocol))
			.map(({ protocol, auth, host, pathname, query }) => {
				if (protocol === 'rocketchat:') {
					const { insecure } = querystring.parse(query);
					protocol = insecure ? 'http:' : 'https:';
				}

				auth = /^([^:]+?):(.+)$/.exec(auth);
				const [, username, password] = auth || [];
				auth = (username && password && `${ username }:${ password }@`) ||
					(username && `${ username }@`) ||
					'';

				return {
					title: `${ protocol }//${ host }${ pathname || '' }`,
					url: `${ protocol }//${ host }${ pathname || '' }`,
					authUrl: `${ protocol }//${ auth }${ host }${ pathname || '' }`,
					username,
					password,
				};
			});
	}

	async validate({ url }, timeout = 5000) {
		try {
			const response = await Promise.race([
				fetch(`${ url.replace(/\/$/, '') }/api/info`),
				new Promise((resolve, reject) => setTimeout(() => reject('timeout'), timeout)),
			]);

			return response.ok ? 'valid' : 'invalid';
		} catch (error) {
			console.error(`Failed to fetch ${ url }: ${ error }`);
			return 'invalid';
		}
	}

	update({ url, ...props }) {
		if (!this.items[url]) {
			return;
		}

		const server = { ...this.items[url], url, ...props };

		if (server.url === 'https://open.rocket.chat/') {
			server.title = 'Rocket.Chat';
		} else if (server.url === 'https://unstable.rocket.chat/') {
			server.title = 'Rocket.Chat (unstable)';
		} else if (server.title === 'Rocket.Chat' && server.url !== 'https://open.rocket.chat/') {
			server.title = `${ server.title } - ${ server.url }`;
		}

		this.items = { ...this.items, [server.url]: server };
		this.persist();
		this.emit('title-setted', server);
	}

	remove({ url }) {
		const { [url]: server, ...items } = this.items;

		if (!server) {
			return;
		}

		this.items = items;
		this.persist();
		this.emit('host-removed', server);

		if (this.active === server.url) {
			this.clearActive();
		}

		remote.getCurrentWebContents().session.clearStorageData({
			origin: server.url,
		});
	}

	get ordered() {
		const items = Object.values(this.items);
		return items.sort(({ order: a = items.length }, { order: b = items.length }) => a - b);
	}

	sort(orderedUrls) {
		if (!Array.isArray(orderedUrls)) {
			return;
		}

		orderedUrls.forEach((url, i) => {
			this.items[url].order = i;
		});

		this.persist();
		this.emit('sorted', this.ordered);
	}

	persist() {
		localStorage.setItem('rocket.chat.hosts', JSON.stringify(this.items));

		if (this.active) {
			localStorage.setItem('rocket.chat.currentHost', this.active);
		} else {
			localStorage.removeItem('rocket.chat.currentHost');
		}

		localStorage.setItem('rocket.chat.sortOrder', JSON.stringify(this.ordered.map(({ url }) => url)));

		ipcRenderer.sendSync('update-servers', this.items);
	}

	load() {
		try {
			this.items = JSON.parse(localStorage.getItem('rocket.chat.hosts'));
		} catch (error) {
			this.items = {};
		}

		if (typeof this.items === 'string') {
			this.items = this.parseUrls([this.items]);
		}

		if (Array.isArray(this.items)) {
			this.items = this.items.reduce((items, url) => {
				const [server] = this.parseUrls([url]);
				return ({ ...items, [server.url]: server });
			}, {});
		}

		if (Object.values(this.items).length === 0) {
			this.items = ipcRenderer.sendSync('get-default-servers');
		}

		for (const [url, server] of Object.entries(this.items)) {
			if (url !== server.url) {
				delete this.items[url];
				this.items[server.url] = server;
			}
		}

		try {
			const orderedUrls = JSON.parse(localStorage.getItem('rocket.chat.sortOrder'));
			Array.isArray(orderedUrls) && orderedUrls.forEach((url, i) => {
				this.items[url].order = i;
			});
		} catch (error) {
			for (const server of Object.values(this.items)) {
				delete server.order;
			}
		}

		this.ordered.forEach((server, i) => {
			server.order = i;
		});

		this.active = localStorage.getItem('rocket.chat.currentHost');

		if (!this.items[this.active]) {
			this.active = null;
		}

		this.persist();
		this.emit('loaded');
	}

	getActive() {
		return this.items[this.active];
	}

	setActive({ url }) {
		const server = this.items[url];
		this.active = server ? server.url : null;
		this.persist();

		if (server) {
			this.emit('active-setted', server);
		} else {
			this.emit('active-cleared');
		}
	}

	clearActive() {
		this.active = null;
		this.persist();

		this.emit('active-cleared');
	}
}


export default new Servers;
