import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	openDevToolsForWebview,
	reloadWebview,
	removeServerFromUrl,
	showServer,
	sortServers,
} from '../../store/actions';
import { Server } from './Server';


const Wrapper = styled.ol`
	flex: 1 1 0;
	margin: 8px 0;
	padding: 0;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	list-style: none;
	-webkit-app-region: no-drag;
`;

const useRedux = () => {
	const state = useSelector(({ servers, view }) => ({ servers, view }));

	const dispatch = useDispatch();

	const handleSelect = (url) => {
		dispatch(showServer(url));
	};

	const handleReload = (url) => {
		dispatch(reloadWebview({ url }));
	};

	const handleRemove = (url) => {
		dispatch(removeServerFromUrl(url));
	};

	const handleOpenDevTools = (url) => {
		dispatch(openDevToolsForWebview(url));
	};

	const handleSort = (urls) => {
		dispatch(sortServers(urls));
	};

	return {
		...state,
		handleSelect,
		handleReload,
		handleRemove,
		handleOpenDevTools,
		handleSort,
	};
};

const useShortcuts = () => {
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

	return shortcutsVisible;
};

const useServers = () => {
	const {
		servers: propServers,
		handleSort,
	} = useRedux();

	const [dragged, setDragged] = useState(null);
	const [servers, setServers] = useState(propServers);

	useEffect(() => {
		setServers(propServers);
	}, [propServers.map(({ url }) => url).join('')]);

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
		handleSort(servers.map(({ url }) => url));
	};

	return {
		servers,
		dragged,
		handleDragStart,
		handleDragEnd,
		handleDragEnter,
		handleDragOver,
		handleDrop,
	};
};

export function ServerList() {
	const {
		view,
		handleSelect,
		handleReload,
		handleRemove,
		handleOpenDevTools,
	} = useRedux();

	const shortcutsVisible = useShortcuts();

	const {
		servers,
		dragged,
		handleDragStart,
		handleDragEnd,
		handleDragEnter,
		handleDragOver,
		handleDrop,
	} = useServers();

	return (
		<Wrapper>
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
					onSelect={() => handleSelect(server.url)}
					onReload={() => handleReload(server.url)}
					onRemove={() => handleRemove(server.url)}
					onOpenDevTools={() => handleOpenDevTools(server.url)}
					onDragStart={handleDragStart.bind(null, server.url)}
					onDragEnd={handleDragEnd}
					onDragEnter={handleDragEnter.bind(null, server.url)}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				/>
			))}
		</Wrapper>
	);
}
