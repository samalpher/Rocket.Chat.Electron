import styled from '@emotion/styled';


export const ModalContent = styled.div`
	max-width: 776px;
	align-items: center;
	justify-content: center;
`;

export const ScreenshareSources = styled.div`
	display: flex;
	overflow-y: auto;
	width: 100%;
	align-items: stretch;
	flex-wrap: wrap;
	justify-content: center;
`;

export const ScreenshareSource = styled.div`
	display: flex;
	flex-flow: column nowrap;
	padding: 1rem;
	cursor: pointer;
	&:hover {
		background-color: var(--color-dark-10);
	}
`;

export const ScreenshareSourceThumbnail = styled.img`
	width: 150px;
`;

export const ScreenshareSourceName = styled.span`
	width: 150px;
	text-align: center;
`;
