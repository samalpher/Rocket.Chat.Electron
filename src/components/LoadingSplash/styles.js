import { css } from '@emotion/core';
import styled from '@emotion/styled';


export const Outer = styled.div`
	${ ({ visible }) => (
		visible
			? css`display: flex;`
			: css`display: none;`
	) }
	flex-flow: column nowrap;
	width: 100vw;
	height: 100vh;
	align-items: center;
	justify-content: center;
	background-color: var(--color-dark);
	-webkit-app-region: drag;
`;

export const Inner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100vw;
	max-width: 30rem;
	height: 8rem;
	padding: 0 1rem;
`;
