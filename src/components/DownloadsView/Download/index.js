import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../Button';
import { useActions } from './hooks';
import {
	Item,
	Info,
	Name,
	Progress,
	ProgressBar,
	Actions,
	StyledClearIcon,
	StyledOpenFolderIcon,
} from './styles';


const formatMemorySize = (fileBytes) => {
	const formats = ['Bytes', 'KB', 'MB', 'GB'];
	const calcFormat = Math.floor(Math.log(fileBytes) / Math.log(1024));
	return `${ parseFloat((fileBytes / Math.pow(1024, calcFormat)).toFixed(2)) } ${ formats[calcFormat] }`;
};

export function Download({ id, filePath, fileName, transferred, total }) {
	const {
		clearDownload,
		showFile,
		showFileInFolder,
	} = useActions(id, filePath);

	const { t } = useTranslation();

	const handleClearDownload = (event) => {
		event.stopPropagation();
		clearDownload(id);
	};

	const handleShowFile = () => {
		showFile(filePath);
	};

	const handleShowFileInFolder = (event) => {
		event.stopPropagation();
		showFileInFolder(filePath);
	};

	return (
		<Item onClick={handleShowFile}>
			<Info>
				<Name>
					{fileName}
				</Name>
				<Progress>
					{t('downloads.progress', {
						transferred: formatMemorySize(transferred),
						total: formatMemorySize(total),
					})}
				</Progress>
				<ProgressBar
					value={transferred}
					min={0}
					max={total}
				/>
			</Info>
			<Actions>
				<Button secondary small onClick={handleShowFileInFolder}>
					<StyledOpenFolderIcon />
				</Button>
				<Button danger small onClick={handleClearDownload}>
					<StyledClearIcon />
				</Button>
			</Actions>
		</Item>
	);
}
