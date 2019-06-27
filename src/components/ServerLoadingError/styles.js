import { css } from '@emotion/core';
import styled from '@emotion/styled';


export const Container = styled.div`
	${ ({ visible }) => css`opacity: ${ visible ? 1 : 0 };` }
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	transition: opacity var(--transitions-duration);
	display: flex;
	flex-direction: column;
	cursor: default;
	user-select: none;
	background-color: #2f343d;
	background-image: url('../public/images/not-found.jpg');
	background-repeat: no-repeat;
	background-position: center bottom;
	background-size: cover;
	align-items: center;
	justify-content: center;
`;

export const Title = styled.h2`
	display: block;
	text-align: center;
	color: rgba(255, 255, 255, 0.85);
	font-size: 2em;
	line-height: 1.5em;
	margin: 0.67em 0;
	font-weight: bold;
`;

export const Subtitle = styled.h3`
	display: block;
	text-align: center;
	color: rgba(255, 255, 255, 0.85);
	font-size: 1.5em;
	line-height: 1.5em;
	margin: 0.67em 0;
	font-weight: normal;
`;

export const ReloadButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 5rem;
`;
