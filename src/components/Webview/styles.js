import { css } from '@emotion/core';
import styled from '@emotion/styled';


export const WebviewComponent = styled('webview')`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	transition: opacity var(--transitions-duration);
	${ ({ active }) => css`
		z-index: ${ active ? 1 : 'unset' };
		opacity: ${ active ? 1 : 0 };
	` }
`;
