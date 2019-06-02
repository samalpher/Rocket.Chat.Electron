import styled from '@emotion/styled';
import { desktopCapturer } from 'electron';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { screensharingSourceSelected } from '../../store/actions';
import { Modal, ModalTitle } from '../ui/Modal';


const ModalContent = styled.div`
	max-width: 776px;
	align-items: center;
	justify-content: center;
`;

const ScreenshareSources = styled.div`
	display: flex;
	overflow-y: auto;
	width: 100%;
	align-items: stretch;
	flex-wrap: wrap;
	justify-content: center;
`;

const ScreenshareSource = styled.div`
	display: flex;
	flex-flow: column nowrap;
	padding: 1rem;
	cursor: pointer;
	&:hover {
		background-color: var(--color-dark-10);
	}
`;

const ScreenshareSourceThumbnail = styled.img`
	width: 150px;
`;

const ScreenshareSourceName = styled.span`
	width: 150px;
	text-align: center;
`;

const mapStateToProps = ({ modal }) => ({ open: modal === 'screenshare' });

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
		}, [open]);

		return !!(open && sources.length > 0) && (
			<Modal open>
				<ModalContent>
					<ModalTitle>{i18n.__('dialog.screenshare.announcement')}</ModalTitle>
					<ScreenshareSources>
						{sources.map(({ id, name, thumbnail }) => (
							<ScreenshareSource
								key={id}
								onClick={() => onSelectSource(id)}
							>
								<ScreenshareSourceThumbnail
									src={thumbnail.toDataURL()}
									alt={name}
								/>
								<ScreenshareSourceName>
									{name}
								</ScreenshareSourceName>
							</ScreenshareSource>
						))}
					</ScreenshareSources>
				</ModalContent>
			</Modal>
		);
	}
);
