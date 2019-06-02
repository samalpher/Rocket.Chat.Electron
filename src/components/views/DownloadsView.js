import styled from '@emotion/styled';
import { shell } from 'electron';
import React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { clearDownload, clearAllDownloads } from '../../store/actions';
import { Button } from '../ui/Button';
import { View } from '../View';
import ClearIcon from './clear.svg';
import OpenFolderIcon from './openFolder.svg';


const Wrapper = styled(View)`
	background-color: var(--color-dark-05);
`;

const Header = styled.header`
	flex: 0 0 auto;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid var(--color-dark-10);
`;

const Title = styled.h2`
	flex: 1;
	color: var(--color-dark-70);
	margin: 0;
`;

const List = styled.ul`
	flex: 1;
	margin: 0;
	padding: 1rem;
	list-style: none;
	overflow-y: auto;
`;

const Item = styled.li`
	display: flex;
	flex-flow: row nowrap;
	margin: -0.25rem;
	padding: 0.5rem 0;
	cursor: pointer;
`;

const Info = styled.div`
	margin: 0.25rem;
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
`;

const Name = styled.div`
	color: var(--color-dark-70);
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const Progress = styled.div`
	color: var(--color-dark-30);
	font-size: 0.75rem;
	line-height: 1.5;
`;

const ProgressBar = styled.progress`
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

const Actions = styled.div`
	flex: 0 0 auto;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	${ Button } {
		margin: 0.25rem;
	}
`;

const StyledOpenFolderIcon = styled(OpenFolderIcon)`width: 20px;`;
const StyledClearIcon = styled(ClearIcon)`width: 20px;`;

const formatMemorySize = (fileBytes) => {
	const formats = ['Bytes', 'KB', 'MB', 'GB'];
	const calcFormat = Math.floor(Math.log(fileBytes) / Math.log(1024));
	return `${ parseFloat((fileBytes / Math.pow(1024, calcFormat)).toFixed(2)) } ${ formats[calcFormat] }`;
};

const mapStateToProps = ({
	view,
	downloads,
	// update: {
	// 	download,
	// },
}) => ({
	visible: view === 'downloads',
	items: downloads,
});

const mapDispatchToProps = (dispatch) => ({
	onClearAllDownloads: () => {
		dispatch(clearAllDownloads());
	},
	onClearDownload: ({ id }, event) => {
		dispatch(clearDownload(id));
		event.stopPropagation();
	},
	onShowFile: (item) => {
		shell.openItem(item.filePath);
	},
	onShowFileInFolder: (item, event) => {
		shell.showItemInFolder(item.filePath);
		event.stopPropagation();
	},
});

export const DownloadsView = connect(mapStateToProps, mapDispatchToProps)(
	function DownloadsView({ visible, items, onClearAllDownloads, onClearDownload, onShowFile, onShowFileInFolder }) {
		return (
			<Wrapper visible={visible}>
				<Header>
					<Title>
						{i18n.__('downloads.title')}
					</Title>

					<Button primary onClick={onClearAllDownloads}>
						{i18n.__('downloads.clear')}
					</Button>
				</Header>

				<List>
					{items.map((item) => (
						<Item key={item.id} onClick={onShowFile.bind(null, item)}>
							<Info>
								<Name>
									{item.fileName}
								</Name>
								<Progress>
									{i18n.__('downloads.progress', {
										transferred: formatMemorySize(item.transferred),
										total: formatMemorySize(item.total),
									})}
								</Progress>
								<ProgressBar
									value={item.transferred}
									min={0}
									max={item.total}
								/>
							</Info>
							<Actions>
								<Button secondary small onClick={onShowFileInFolder.bind(null, item)}>
									<StyledOpenFolderIcon />
								</Button>
								<Button danger small onClick={onClearDownload.bind(null, item)}>
									<StyledClearIcon />
								</Button>
							</Actions>
						</Item>
					))}
				</List>
			</Wrapper>
		);
	}
);
