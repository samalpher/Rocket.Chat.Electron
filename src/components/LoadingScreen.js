/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { LoadingIndicator } from './ui/LoadingIndicator';
import { RocketChatLogo } from './ui/RocketChatLogo';


export const LoadingScreen = () => (
	<section
		css={css`
			display: flex;
			flex-flow: column nowrap;
			width: 100vw;
			height: 100vh;
			align-items: center;
			justify-content: center;
			background-color: var(--color-dark);
			-webkit-app-region: drag;
		`}
	>
		<div
			css={css`
				display: flex;
				flex-flow: column nowrap;
				align-items: center;
				justify-content: center;
				width: 100vw;
				max-width: 30rem;
				height: 8rem;
				padding: 0 1rem;
			`}
		>
			<RocketChatLogo dark />
			<LoadingIndicator />
		</div>
	</section>
);
