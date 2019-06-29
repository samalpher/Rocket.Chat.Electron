import styled from '@emotion/styled';
import { Button } from '../Button';


export const ModalDialog = styled.dialog`
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: none;
	flex-flow: column nowrap;
	padding: 0.75rem;
	cursor: default;
	user-select: none;
	color: var(--color-dark-70);
	border: 1px solid var(--color-dark-70);
	background-color: var(--color-dark-05);

	&::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	&[open] {
		display: flex;
	}
`;

export const ModalTitle = styled.h2`
	margin: 0 0 1rem;
	font-size: 1.5rem;
	line-height: normal;
`;

export const ModalActions = styled.div`
	display: flex;
	flex: 0 0 auto;
	flex-flow: row nowrap;
	justify-content: flex-end;
	margin: 0 -0.25rem;
	${ Button } {
		margin: 0 0.25rem;
	}
`;
