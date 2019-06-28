import React from 'react';
import { Actions } from './Actions';
import { ServerList } from './ServerList';
import { useRedux } from './hooks';
import { Container } from './styles';


export function Sidebar() {
	const {
		background,
		color,
		visible,
	} = useRedux();

	return (
		<Container
			background={background}
			color={color}
			visible={visible}
		>
			<ServerList />
			<Actions />
		</Container>
	);
}
