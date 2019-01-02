import { remote } from 'electron';
import htm from 'htm';
import React from 'react';
import { __ } from '../i18n';
import { connect } from './AppState';
const { getCurrentWindow, Menu } = remote;
const html = htm.bind(React.createElement);


class Server extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			faviconLoaded: false,
			hotkeyVisible: false,
		};

		this.handleFaviconLoad = this.handleFaviconLoad.bind(this);
		this.handleKeyDownForHotKeys = this.handleKeyStateForHotKeys.bind(this, true);
		this.handleKeyUpForHotKeys = this.handleKeyStateForHotKeys.bind(this, false);
		this.handleContextMenu = this.handleContextMenu.bind(this);
	}

	handleFaviconLoad() {
		this.setState({ faviconLoaded: true });
	}

	handleKeyStateForHotKeys(hotkeyVisible, event) {
		if (['Control', 'Meta'].includes(event.key)) {
			this.setState({ hotkeyVisible });
		}
	}

	handleContextMenu(event) {
		event.preventDefault();
		const template = this.createMenuTemplate();
		const menu = Menu.buildFromTemplate(template);
		menu.popup(getCurrentWindow());
	}

	createMenuTemplate() {
		const { onReload, onRemove, onOpenDevToolsFor } = this.props;

		return [
			{
				label: __('Reload_server'),
				click: onReload,
			},
			{
				label: __('Remove_server'),
				click: onRemove,
			},
			{
				type: 'separator',
			},
			{
				label: __('Open DevTools'),
				click: onOpenDevToolsFor,
			},
		];
	}

	componentDidMount() {
		window.addEventListener('keydown', this.handleKeyDownForHotKeys, false);
		window.addEventListener('keyup', this.handleKeyUpForHotKeys, false);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyDownForHotKeys, false);
		window.removeEventListener('keyup', this.handleKeyUpForHotKeys, false);
	}

	createInitials(title) {
		let name = title.replace(/^https?:\/\/(?:www\.)?([^\/]+)(.*)/, '$1')
			.split('.');
		name = name[0][0] + (name[1] ? name[1][0] : '');
		return name.toUpperCase();
	}

	render() {
		const {
			active,
			badge,
			index,
			moving,
			title,
			url,
			onActivate,
			onDragOver,
			onDragStart,
			onDragEnter,
			onDragEnd,
			onDrop,
		} = this.props;

		const {
			faviconLoaded,
			hotkeyVisible,
		} = this.state;

		const className = [
			'ServerList__item',
			'Server',
			active && 'Server--active',
			moving && 'Server--moving',
			badge && 'Server--unread',
		].filter(Boolean).join(' ');

		return html`
		<li
			className=${ className }
			draggable="true"
			data-tooltip=${ title }
			onClick=${ onActivate }
			onContextMenu=${ this.handleContextMenu }
			onDragOver=${ onDragOver }
			onDragStart=${ onDragStart }
			onDragEnter=${ onDragEnter }
			onDragEnd=${ onDragEnd }
			onDrop=${ onDrop }
		>
			<span style=${ { display: faviconLoaded ? 'none' : '' } }>${ this.createInitials(title) }</span>
			<div className="Server__badge">${ badge }</div>
			<img
				style=${ { display: faviconLoaded ? 'initial' : '' } }
				src=${ `${ url.replace(/\/$/, '') }/assets/favicon.svg` }
				onLoad=${ faviconLoaded ? null : this.handleFaviconLoad }
			/>
			${ hotkeyVisible ? html`
				<div className="Server__hotkey">${ `${ process.platform === 'darwin' ? '⌘' : '^' }${ index }` }</div>
			` : null }
		</li>
		`;
	}
}


const AddServer = ({ onAddServer }) => html`
<li
	className="ServerList__item AddServer"
	data-tooltip=${ __('Add new server') }
	onClick=${ onAddServer }
>
	<span>+</span>
</li>
`;


class Sidebar extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			moving: false,
		};

		this.renderServer = this.renderServer.bind(this);
	}

	handleDragOver(server, event) {
		event.preventDefault();
	}

	handleDragStart(server, event) {
		event.dataTransfer.dropEffect = 'move';
		event.dataTransfer.effectAllowed = 'move';
		this.setState({
			servers: this.props.servers,
			moving: server.url,
		});
	}

	handleDragEnter(server) {
		const srcServer = this.state.servers.find(({ url }) => url === this.state.moving);
		const destServer = this.state.servers.find(({ url }) => url === server.url);
		this.setState({
			servers: this.state.servers.map((server) => {
				if (server.url === srcServer.url) {
					return destServer;
				}

				if (server.url === destServer.url) {
					return srcServer;
				}

				return server;
			}),
		});
	}

	handleDragEnd() {
		this.setState({ moving: null });
	}

	handleDrop(server, event) {
		event.preventDefault();

		const orderedUrls = this.state.servers.map(({ url }) => url);

		this.props.onSortServers && this.props.onSortServers.call(null, orderedUrls);
		this.props.onActivateServer && this.props.onActivateServer.call(null, server);

		this.setState({ servers: null });
	}

	renderServer(server, i) {
		const { activeServerUrl, badges = {}, onActivateServer, onReloadServer, onRemoveServer, onOpenDevToolsForServer } = this.props;
		const { moving } = this.state;

		return html`
		<${ Server }
			key=${ server.url }
			active=${ server.url === activeServerUrl }
			badge=${ badges[server.url] }
			index=${ i + 1 }
			moving=${ server.url === moving }
			title=${ server.title }
			url=${ server.url }
			onActivate=${ onActivateServer.bind(null, server) }
			onReload=${ onReloadServer.bind(null, server) }
			onRemove=${ onRemoveServer.bind(null, server) }
			onOpenDevToolsFor=${ onOpenDevToolsForServer.bind(null, server) }
			onDragOver=${ this.handleDragOver.bind(this, server) }
			onDragStart=${ this.handleDragStart.bind(this, server) }
			onDragEnter=${ this.handleDragEnter.bind(this, server) }
			onDragEnd=${ this.handleDragEnd.bind(this, server) }
			onDrop=${ this.handleDrop.bind(this, server) }
		/>
		`;
	}

	render() {
		const { activeServerUrl, backgrounds = {}, colors = {}, visible, onAddServer } = this.props;

		return html`
		<div
			className=${ ['Sidebar', !visible && 'Sidebar--hidden'].filter(Boolean).join(' ') }
			style=${ { background: backgrounds[activeServerUrl] || '', color: colors[activeServerUrl] || '' } }
		>
			<div
				className=${ ['Sidebar__inner', process.platform === 'darwin' && 'Sidebar__inner--mac'].filter(Boolean).join(' ') }
			>
				<ol className="Sidebar__server-list ServerList">
					${ (this.state.servers || this.props.servers || []).map(this.renderServer) }
					<${ AddServer } onAddServer=${ onAddServer } />
				</ol>
			</div>
		</div>
		`;
	}
}


export default connect(({
	activeServerUrl,
	backgrounds,
	badges,
	colors,
	servers,
	sidebarVisible,
	onActivateServer,
	onAddServer,
	onReloadServer,
	onRemoveServer,
	onOpenDevToolsForServer,
	onSortServers,
}) => ({
	activeServerUrl,
	backgrounds,
	badges,
	colors,
	servers,
	visible: sidebarVisible,
	onActivateServer,
	onAddServer,
	onReloadServer,
	onRemoveServer,
	onOpenDevToolsForServer,
	onSortServers,
}))(Sidebar);
