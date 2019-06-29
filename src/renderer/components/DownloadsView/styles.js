import styled from '@emotion/styled';
import { View } from '../View';


export const Container = styled(View)`
	background-color: var(--color-dark-05);
`;

export const Header = styled.header`
	flex: 0 0 auto;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid var(--color-dark-10);
`;

export const Title = styled.h2`
	flex: 1;
	color: var(--color-dark-70);
	margin: 0;
`;

export const List = styled.ul`
	flex: 1;
	margin: 0;
	padding: 1rem;
	list-style: none;
	overflow-y: auto;
`;
