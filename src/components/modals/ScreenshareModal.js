/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { desktopCapturer } from 'electron';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { screensharingSourceSelected } from '../../store/actions';
import { Modal } from '../ui/Modal';


const ScreenshareModalTitle = () => (
	<h2
		css={css`
			margin: 0 0 1rem;
			font-size: 1.5rem;
			line-height: normal;
		`}
	>
		{i18n.__('dialog.screenshare.announcement')}
	</h2>
);

const ScreenshareSources = ({ children }) => (
	<div
		css={css`
			display: flex;
			overflow-y: auto;
			width: 100%;
			align-items: stretch;
			flex-wrap: wrap;
			justify-content: center;
		`}
	>
		{children}
	</div>
);

const ScreenshareSource = ({ name, thumbnail, onClick }) => (
	<div
		css={css`
			display: flex;
			flex-direction: column;
			padding: 1rem;
			cursor: pointer;
			&:hover {
				background-color: var(--tertiary-background-color);
			}
		`}
		onClick={onClick}
	>
		<div
			css={css`
				width: 150px;
			`}
		>
			<img src={thumbnail} alt={name} />
		</div>
		<div
			css={css`
				width: 150px;
				text-align: center;
			`}
		>
			{name}
		</div>
	</div>
);

const mapStateToProps = ({ modal }) => ({
	open: modal === 'screenshare',
});

const mapDispatchToProps = (dispatch) => ({
	onSelectSource: (id) => dispatch(screensharingSourceSelected(id)),
});

export const ScreenshareModal = connect(mapStateToProps, mapDispatchToProps)(
	function ScreenshareModal({ open, onSelectSource }) {

		const [sources, setSources] = useState([]);

		useEffect(() => {
			if (open && sources.length === 0) {
				desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
					if (error) {
						throw error;
					}
					setSources(sources);
				});
			}

			if (!open && sources.length > 0) {
				setSources([]);
			}
		});

		return !!(open && sources.length > 0) && (
			<Modal
				open
				css={css`
					max-width: 776px;
					align-items: center;
					justify-content: center;
				`}
			>
				<ScreenshareModalTitle />
				<ScreenshareSources>
					{sources.map(({ id, name, thumbnail }) => (
						<ScreenshareSource
							key={id}
							name={name}
							thumbnail={thumbnail.toDataURL()}
							onClick={() => onSelectSource(id)}
						/>
					))}
				</ScreenshareSources>
			</Modal>
		);
	}
);
