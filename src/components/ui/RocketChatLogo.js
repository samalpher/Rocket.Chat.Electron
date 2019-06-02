import styled from '@emotion/styled';
import React from 'react';
import LightLogo from './logo-light.svg';
import DarkLogo from './logo-dark.svg';


const StyledLightLogo = styled(LightLogo)`
	flex: 1;
	width: 100%;
	height: auto;
`;

const StyledDarkLogo = styled(DarkLogo)`
	flex: 1;
	width: 100%;
	height: auto;
`;

export const RocketChatLogo = ({ dark = false }) => (
	dark ? <StyledDarkLogo /> : <StyledLightLogo />
);
