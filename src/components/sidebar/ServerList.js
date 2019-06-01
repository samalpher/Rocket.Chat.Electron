/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Server } from './Server';
import {
	openDevToolsForWebview,
	reloadWebview,
	removeServerFromUrl,
	showServer,
	sortServers,
} from '../../store/actions';


const mapStateToProps = ({
	servers,
	view,
}) => ({
	servers,
	view,
});

const mapDispatchToProps = (dispatch) => ({
	onSelect: (url) => dispatch(showServer(url)),
	onReload: (url) => dispatch(reloadWebview({ url })),
	onRemove: (url) => dispatch(removeServerFromUrl(url)),
	onOpenDevTools: (url) => dispatch(openDevToolsForWebview(url)),
	onSort: (urls) => dispatch(sortServers(urls)),
});

export const ServerList = connect(mapStateToProps, mapDispatchToProps)(
	function ServerList({ servers: propServers, view, onSelect, onReload, onRemove, onOpenDevTools, onSort }) {
		const [dragged, setDragged] = useState(null);
		const [servers, setServers] = useState(propServers);
		const [shortcutsVisible, setShortcutsVisible] = useState(false);

		useEffect(() => {
			const shortcutKey = process.platform === 'darwin' ? 'Meta' : 'Control';

			const onShortcutKeyDown = ({ key }) => {
				key === shortcutKey && setShortcutsVisible(true);
			};

			const onShortcutKeyUp = ({ key }) => {
				key === shortcutKey && setShortcutsVisible(false);
			};

			window.addEventListener('keydown', onShortcutKeyDown);
			window.addEventListener('keyup', onShortcutKeyUp);

			return () => {
				window.removeEventListener('keydown', onShortcutKeyDown);
				window.removeEventListener('keyup', onShortcutKeyUp);
			};
		}, []);

		useEffect(() => {
			setServers(propServers);
		}, propServers.map(({ url }) => url));

		const handleDragStart = (url, event) => {
			setDragged(url);

			event.dataTransfer.dropEffect = 'move';
			event.dataTransfer.effectAllowed = 'move';
		};

		const handleDragEnd = () => {
			setDragged(null);
		};

		const handleDragEnter = (targetUrl) => {
			const draggedServerIndex = servers.findIndex(({ url }) => url === dragged);
			const targetServerIndex = servers.findIndex(({ url }) => url === targetUrl);

			setServers(servers.map((server, i) => (
				(i === draggedServerIndex && servers[targetServerIndex]) ||
				(i === targetServerIndex && servers[draggedServerIndex]) ||
				server
			)));
		};

		const handleDragOver = (event) => {
			event.preventDefault();
		};

		const handleDrop = (event) => {
			event.preventDefault();
			onSort(servers.map(({ url }) => url));
		};

		return (
			<ol
				css={css`
					flex: 1 1 0;
					margin: 8px 0;
					padding: 0;
					display: flex;
					flex-flow: column nowrap;
					align-items: stretch;
					list-style: none;
					-webkit-app-region: no-drag;
				`}
			>
				{servers.map((server, order) => (
					<Server
						key={order}
						url={server.url}
						title={server.title}
						badge={server.badge}
						order={order}
						active={server.url === view.url}
						dragged={server.url === dragged}
						shortcut={shortcutsVisible}
						onSelect={() => onSelect(server.url)}
						onReload={() => onReload(server.url)}
						onRemove={() => onRemove(server.url)}
						onOpenDevTools={() => onOpenDevTools(server.url)}
						onDragStart={handleDragStart.bind(null, server.url)}
						onDragEnd={handleDragEnd}
						onDragEnter={handleDragEnter.bind(null, server.url)}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					/>
				))}
			</ol>
		);
	}
);
