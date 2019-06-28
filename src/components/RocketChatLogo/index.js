import React from 'react';
import { StyledDarkLogo, StyledLightLogo } from './styles';


export function RocketChatLogo({ dark = false, ...props }) {
	if (dark) {
		return <StyledDarkLogo {...props} />;
	}


	return <StyledLightLogo {...props} />;
}
