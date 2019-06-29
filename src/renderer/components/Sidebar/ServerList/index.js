import React from 'react';
import { Server } from './Server';
import { Container } from './styles';
import { useServers, useShortcuts } from './hooks';


export function ServerList() {
	const {
		servers,
		active,
		dragged,
		handleDragStart,
		handleDragEnd,
		handleDragEnter,
		handleDragOver,
		handleDrop,
	} = useServers();

	const shortcutsVisible = useShortcuts();

	return (
		<Container>
			{servers.map((server, order) => (
				<Server
					key={order}
					url={server.url}
					title={server.title}
					badge={server.badge}
					order={order}
					active={server.url === active}
					dragged={server.url === dragged}
					shortcut={shortcutsVisible}
					onDragStart={handleDragStart.bind(null, server.url)}
					onDragEnd={handleDragEnd}
					onDragEnter={handleDragEnter.bind(null, server.url)}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				/>
			))}
		</Container>
	);
}
