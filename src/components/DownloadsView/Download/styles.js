import styled from '@emotion/styled';
import { Button } from '../../Button';
import ClearIcon from './clear.svg';
import OpenFolderIcon from './openFolder.svg';


export const Item = styled.li`
	display: flex;
	flex-flow: row nowrap;
	margin: -0.25rem;
	padding: 0.5rem 0;
	cursor: pointer;
`;

export const Info = styled.div`
	margin: 0.25rem;
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
`;

export const Name = styled.div`
	color: var(--color-dark-70);
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const Progress = styled.div`
	color: var(--color-dark-30);
	font-size: 0.75rem;
	line-height: 1.5;
`;

export const ProgressBar = styled.progress`
	& {
		-webkit-appearance: none;
   	appearance: none;
		width: 100%;
		height: 8px;
		border-radius: 2px;
		overflow: hidden;
	}

	&[value]::-webkit-progress-bar {
		background-color: var(--color-dark-30);
	}

	&[value]::-webkit-progress-value {
		background-color: var(--color-blue);
	}
`;

export const Actions = styled.div`
	flex: 0 0 auto;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	${ Button } {
		margin: 0.25rem;
	}
`;

export const StyledOpenFolderIcon = styled(OpenFolderIcon)`width: 20px;`;
export const StyledClearIcon = styled(ClearIcon)`width: 20px;`;
