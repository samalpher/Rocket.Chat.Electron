import React from 'react';
import { LoadingIndicator } from '../LoadingIndicator';
import { RocketChatLogo } from '../RocketChatLogo';
import { Outer, Inner } from './styles';


export function LoadingSplash({ visible, ...props }) {
	return (
		<Outer visible={visible}>
			<Inner {...props}>
				<RocketChatLogo dark />
				<LoadingIndicator />
			</Inner>
		</Outer>
	);
}
