/** @jsx jsx */
import { css, jsx } from '@emotion/core';


export const SidebarTooltip = ({ text }) => (
	<div
		css={css`
			position: fixed;
			left: 64px;
			visibility: hidden;
			padding: 0.5rem 1rem;
			transition: all var(--transitions-duration) ease-out var(--transitions-duration);
			transform: translateX(20px);
			white-space: nowrap;
			pointer-events: none;
			opacity: 0;
			color: #ffffff;
			border-radius: 4px;
			background-color: #1f2329;
			font-size: 0.875rem;
			line-height: normal;
			*:hover > & {
				visibility: visible;
				transform: translateX(0);
				opacity: 1;
			}
		`}
	>
		{text}
	</div>
);
