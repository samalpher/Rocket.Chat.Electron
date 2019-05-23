/** @jsx jsx */
import { css, jsx } from '@emotion/core';


const lightLogo = './images/logo.svg';
const darkLogo = './images/logo-dark.svg';

export const RocketChatLogo = ({ dark = false }) => (
	<div>
		<img
			css={css`
				flex: 1;
				width: 100%;
			`}
			src={dark ? darkLogo : lightLogo}
		/>
	</div>
);
