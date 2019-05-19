/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { LoadingIndicator } from './ui/LoadingIndicator';


const RocketChatLogo = () => (
	<div>
		<img
			css={css`
				width: 100vw;
				max-width: 520px;
				padding: 0 1rem;
			`}
			src="./images/logo-dark.svg"
		/>
	</div>
);

export const LoadingScreen = () => (
	<section
		css={css`
			display: flex;
			flex-flow: column nowrap;
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			align-items: center;
			justify-content: center;
			background-color: var(--primary-background-color);
			-webkit-app-region: drag;
		`}
	>
		<RocketChatLogo />
		<LoadingIndicator />
	</section>
);
