import { css } from '@emotion/core';
import styled from '@emotion/styled';

export const Outer = styled.div`
	flex: 1;
	margin: 1rem;
	text-align: center;
	white-space: nowrap;
	line-height: normal;
`;

export const Inner = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	${ ({ current }) => current && css`
		color: var(--color-dark-30);
	` }
`;

export const AppVersionUpdateArrow = styled.div`
	flex: 1;
	margin: 1rem;
	font-size: 2rem;
`;
