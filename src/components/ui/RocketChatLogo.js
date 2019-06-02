/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import LightLogo from './logo-light.svg';
import DarkLogo from './logo-dark.svg';


export const RocketChatLogo = ({ dark = false }) => (
	<div>
		{dark ? (
			<DarkLogo
				css={css`
					flex: 1;
					width: 100%;
					height: auto;
				`}
			/>
		) : (
			<LightLogo
				css={css`
					flex: 1;
					width: 100%;
					height: auto;
				`}
			/>
		)}
	</div>
);
