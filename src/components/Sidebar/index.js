import htm from 'htm';
import React from 'react';
import { connect } from '../AppState';
import AddServer from './AddServer';
import Server from './Server';
const html = htm.bind(React.createElement);


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
		const { activeServerUrl, backgrounds = {}, colors = {}, visible } = this.props;

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
					<${ AddServer } />
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
	onReloadServer,
	onRemoveServer,
	onOpenDevToolsForServer,
	onSortServers,
}))(Sidebar);
