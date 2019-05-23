/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { shell } from 'electron';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { Button } from '../ui/Button';
import { clearDownload, clearAllDownloads } from '../../store/actions';


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
	onClearDownload: ({ id }) => {
		dispatch(clearDownload(id));
	},
	onShowFile: (item) => {
		shell.openItem(item.filePath);
	},
	onShowFileInFolder: (item) => {
		shell.showItemInFolder(item.filePath);
	},
});

export const DownloadsView = connect(mapStateToProps, mapDispatchToProps)(
	function DownloadsView({ visible, items, onClearAllDownloads, onClearDownload, onShowFile, onShowFileInFolder }) {
		return (
			<section
				css={css`
					position: absolute;
					left: 0;
					top: 0;
					right: 0;
					bottom: 0;
					display: flex;
					flex-flow: column nowrap;
					transition: opacity linear 100ms;
					opacity: ${ visible ? 1 : 0 };
					${ visible && css`z-index: 1;` };
					background-color: var(--color-dark);
					overflow-y: auto;
					-webkit-app-region: drag;
				`}
			>
				<header
					css={css`
						flex: 0 0 auto;
						display: flex;
						flex-flow: row nowrap;
						align-items: center;
						padding: 1rem;
						border-bottom: 1px solid var(--color-dark-70);
					`}
				>
					<h2
						css={css`
							flex: 1;
							color: var(--color-dark-30);
							margin: 0;
						`}
					>
						{i18n.__('sidebar.downloadManager.title')}
					</h2>

					<Button primary onClick={onClearAllDownloads}>
						{i18n.__('sidebar.downloadManager.clear')}
					</Button>
				</header>

				<ul
					css={css`
						flex: 1;
						margin: 0;
						padding: 1rem;
						list-style: none;
						overflow-y: auto;
					`}
				>
					{items.map((item) => (
						<li
							key={item.id}
							css={css`
								display: flex;
								flex-flow: row nowrap;
								padding: 0.5rem 0;
								cursor: pointer;
							`}
							onClick={onShowFile.bind(null, item)}
						>
							<div
								css={css`
									flex: 1;
									overflow: hidden;
								`}
							>
								<div
									css={css`
										color: var(--color-dark-30);
										line-height: 1.5;
									`}
								>
									{item.fileName}
								</div>
								<div
									css={css`
										color: var(--color-dark-70);
										font-size: 0.75rem;
										line-height: 1.5;
									`}
								>
									{ formatMemorySize(item.transferred) } of { formatMemorySize(item.total) }
								</div>
							</div>
							<div
								css={css`
									flex: 0 0 auto;
									display: flex;
									flex-flow: row nowrap;
									margin: -0.25rem;
									* {
										margin: 0.25rem;
									}
								`}
							>
								<Button secondary small onClick={onShowFileInFolder.bind(null, item)}>
									<FontAwesomeIcon icon={faFolderOpen} />
								</Button>
								<Button danger small onClick={onClearDownload.bind(null, item)}>
									<FontAwesomeIcon icon={faTimes} />
								</Button>
							</div>
						</li>
					))}
				</ul>
			</section>
		);
	}
);
