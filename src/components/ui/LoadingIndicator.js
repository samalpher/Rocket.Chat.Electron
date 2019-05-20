/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/core';


const bounceAnimation = keyframes`
	0%,
	80%,
	100% {
		transform: scale(0);
	}
	40% {
		transform: scale(1);
	}
`;

const dotStyle = (i) => css`
	width: 0.75rem;
	height: 0.75rem;
	margin: 0.15rem;
	animation: ${ bounceAnimation } 1400ms infinite ease-in-out ${ -160 * i }ms both;
	border-radius: 100%;
	background-color: currentColor;
`;

export const LoadingIndicator = (props) => (
	<div
		{...props}
		css={css`
			display: flex;
			color: var(--primary-color, white);
			align-items: center;
			justify-content: center;
		`}
	>
		{Array.from({ length: 3 }, (_, i) => (
			<span key={i} css={dotStyle(i)} />
		))}
	</div>
);
