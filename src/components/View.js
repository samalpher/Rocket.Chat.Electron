import styled from '@emotion/styled';


export const View = styled.section`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-flow: column nowrap;
	z-index: ${ ({ visible }) => (visible ? 1 : 'unset') };
	opacity: ${ ({ visible }) => (visible ? 1 : 0) };
	transition: opacity linear 100ms;
	overflow-y: auto;
`;
