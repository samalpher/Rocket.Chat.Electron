/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SidebarTooltip } from './SidebarTooltip';


export const SidebarButton = ({ icon, label, onClick }) => (
	<button
		css={css`
			position: relative;
			width: 40px;
			height: 40px;
			margin: 4px;
			padding: 0;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			background-color: rgba(0, 0, 0, .1);
			color: inherit;
			cursor: pointer;
			transition:
				background-color var(--transitions-duration),
				color var(--transitions-duration);

			&:active,
			&:focus:hover {
				outline: none;
			}

			&:hover {
				background-color: rgba(255, 255, 255, .05);
			}

			&:active {
				transform: translateY(2px);
				background-color: rgba(255, 255, 255, .1);
			}

			&:active::before {
				top: -2px;
			}

			&::before {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				content: "";
				cursor: pointer;
			}
		`}
		onClick={onClick}
	>
		{icon}
		<SidebarTooltip text={label} />
	</button>
);
