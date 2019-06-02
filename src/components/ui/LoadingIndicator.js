import { css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';


const Outer = styled.div`
	display: flex;
	color: var(--color-dark-30, white);
	align-items: center;
	justify-content: center;
`;

const Dot = styled.span`
	width: 0.75rem;
	height: 0.75rem;
	margin: 0.15rem;
	${ ({ order }) => css`
		animation: ${ keyframes`
			0%,
			80%,
			100% {
				transform: scale(0);
			}
			40% {
				transform: scale(1);
			}
		` } 1400ms infinite ease-in-out ${ -160 * order }ms both;
	` }
	border-radius: 100%;
	background-color: currentColor;
`;

export const LoadingIndicator = (props) => (
	<Outer {...props}>
		{Array.from({ length: 3 }, (_, order) => (
			<Dot key={order} order={order} />
		))}
	</Outer>
);
