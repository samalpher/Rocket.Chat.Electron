/** @jsx jsx */
import { css, jsx } from '@emotion/core';


export const DragRegion = () => (
	<div
		css={css`
			position: fixed;
			width: 100vw;
			height: 22px;
			-webkit-app-region: drag;
		`}
	/>
);
