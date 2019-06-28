import styled from '@emotion/styled';


export const ModalContent = styled.div`
	max-width: 400px;
`;

export const AppInfoSection = styled.section`
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: center;
	margin: 2rem 0;
`;

export const AppVersionOuter = styled.div`
	font-size: 0.75rem;
	text-align: center;
`;

export const AppVersionInner = styled.span`
	cursor: text;
	user-select: text;
	font-weight: bold;
`;

export const UpdateCheckIndicatorWrapper = styled.div`
	display: flex;
	flex-flow: column nowrap;
	height: 2.5rem;
`;

export const UpdateCheckIndicatorMessage = styled.div`
	color: var(--color-dark-30);
	text-align: center;
`;

export const SetAutoUpdateLabel = styled.label`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	margin: 1rem 0;
	font-size: 0.9rem;
`;

export const SetAutoUpdateInput = styled.input`
	margin: 0 0.5rem;
`;

export const UpdateSection = styled.section`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	justify-content: center;
`;

export const CopyrightWrapper = styled.div`
	margin: 0 auto;
	font-size: 0.75rem;
	text-align: center;
`;
