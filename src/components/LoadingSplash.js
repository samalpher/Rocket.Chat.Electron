import styled from '@emotion/styled';
import React from 'react';
import { LoadingIndicator } from './ui/LoadingIndicator';
import { RocketChatLogo } from './ui/RocketChatLogo';


const Outer = styled.div`
	display: ${ ({ visible }) => (visible ? 'flex' : 'none') };
	flex-flow: column nowrap;
	width: 100vw;
	height: 100vh;
	align-items: center;
	justify-content: center;
	background-color: var(--color-dark);
	-webkit-app-region: drag;
`;

const Inner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100vw;
	max-width: 30rem;
	height: 8rem;
	padding: 0 1rem;
`;

export function LoadingSplash({ visible }) {
	return (
		<Outer visible={visible}>
			<Inner>
				<RocketChatLogo dark />
				<LoadingIndicator />
			</Inner>
		</Outer>
	);
}
