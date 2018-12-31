import { remote } from 'electron';
import htm from 'htm';
import React from 'react';
import { __ } from '../i18n';
import AppState from './AppState';
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

	handleKeyStateForHotKeys(hotkeyVisible, e) {
		if (['Control', 'Meta'].includes(e.key)) {
			this.setState({ hotkeyVisible });
		}
	}

	handleContextMenu(event) {
		event.preventDefault();
		const { host } = this.props;
		const menu = Menu.buildFromTemplate(this.createMenuTemplate(host));
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

	handleDragOver(host, event) {
		event.preventDefault();
	}

	handleDragStart(host, event) {
		event.dataTransfer.dropEffect = 'move';
		event.dataTransfer.effectAllowed = 'move';
		this.setState({
			hosts: this.props.hosts,
			moving: host.url,
		});
	}

	handleDragEnter(host) {
		const srcHost = this.state.hosts.find(({ url }) => url === this.state.moving);
		const destHost = this.state.hosts.find(({ url }) => url === host.url);
		this.setState({
			hosts: this.state.hosts.map((host) => {
				if (host.url === srcHost.url) {
					return destHost;
				}

				if (host.url === destHost.url) {
					return srcHost;
				}

				return host;
			}),
		});
	}

	handleDragEnd() {
		this.setState({ moving: null });
	}

	handleDrop(host, event) {
		event.preventDefault();

		const orderedUrls = this.state.hosts.map(({ url }) => url);

		this.props.onSortServers && this.props.onSortServers.call(null, orderedUrls);
		this.props.onActivateServer && this.props.onActivateServer.call(null, host);

		this.setState({ hosts: null });
	}

	updateContainer() {
		const { visible, active, backgrounds = {}, colors = {} } = this.props;

		document.querySelector('.Sidebar').classList[visible ? 'remove' : 'add']('Sidebar--hidden');
		document.querySelector('.Sidebar').style.background = backgrounds[active] || '';
		document.querySelector('.Sidebar').style.color = colors[active] || '';
	}

	componentDidMount() {
		this.updateContainer();
	}

	componentDidUpdate() {
		this.updateContainer();
	}

	renderServer(host, i) {
		const { active, badges = {} } = this.props;
		const { moving } = this.state;

		return html`
		<${ AppState.Consumer } key=${ i }>
			${ ({ onActivateServer, onReloadServer, onRemoveServer, onOpenDevToolsForServer }) => html`
				<${ Server }
					active=${ host.url === active }
					badge=${ badges[host.url] }
					index=${ i + 1 }
					moving=${ host.url === moving }
					title=${ host.title }
					url=${ host.url }
					onActivate=${ onActivateServer.bind(null, host) }
					onReload=${ onReloadServer.bind(null, host) }
					onRemove=${ onRemoveServer.bind(null, host) }
					onOpenDevToolsFor=${ onOpenDevToolsForServer.bind(null, host) }
					onDragOver=${ this.handleDragOver.bind(this, host) }
					onDragStart=${ this.handleDragStart.bind(this, host) }
					onDragEnter=${ this.handleDragEnter.bind(this, host) }
					onDragEnd=${ this.handleDragEnd.bind(this, host) }
					onDrop=${ this.handleDrop.bind(this, host) }
				/>
			` }
		</${ AppState.Consumer }>
		`;
	}

	render() {
		const className = [
			'Sidebar__inner',
			process.platform === 'darwin' && 'Sidebar__inner--mac',
		].filter(Boolean).join(' ');

		return html`
		<div className=${ className }>
			<ol className="Sidebar__server-list ServerList">
				${ (this.state.hosts || this.props.hosts || []).map(this.renderServer) }
				<${ AppState.Consumer }>
					${ ({ onAddServer }) => html`
						<${ AddServer } onAddServer=${ onAddServer } />
					` }
				</${ AppState.Consumer }>
			</ol>
		</div>
		`;
	}
}


const SidebarContainer = () => html`
<${ AppState.Consumer }>
	${ ({
		active,
		backgrounds,
		badges,
		colors,
		hosts,
		sidebarVisible,
		onActivateServer,
		onSortServers,
	}) => html`
		<${ Sidebar }
			active=${ active }
			backgrounds=${ backgrounds }
			badges=${ badges }
			colors=${ colors }
			hosts=${ hosts }
			visible=${ sidebarVisible }
			onActivateServer=${ onActivateServer }
			onSortServers=${ onSortServers }
		/>
	` }
</${ AppState.Consumer }>
`;


export default SidebarContainer;
