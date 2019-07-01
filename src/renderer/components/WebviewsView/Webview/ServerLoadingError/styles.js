import styled from '@emotion/styled';
import { View } from '../../../View';
import notFoundImage from './notFound.jpg';


export const Container = styled(View)`
	background-color: #2f343d;
	background-image: url(${ notFoundImage });
	background-repeat: no-repeat;
	background-position: center bottom;
	background-size: cover;
	align-items: center;
	justify-content: center;
`;

export const Title = styled.h2`
	text-align: center;
	color: rgba(255, 255, 255, 0.85);
	font-size: 2em;
	line-height: 1.5em;
	margin: 0.67em 0;
	font-weight: bold;
`;

export const Subtitle = styled.h3`
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
