import styled from '@emotion/styled';
import { desktopCapturer } from 'electron';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
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

const useRedux = () => {
	const state = useSelector(({ modal }) => ({ open: modal === 'screenshare' }));

	const dispatch = useDispatch();

	const handleSelectSource = (id) => {
		dispatch(screensharingSourceSelected(id));
	};

	return {
		...state,
		handleSelectSource,
	};
};

const useScreensharingSources = () => {
	const { open } = useRedux();
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

	return sources;
};

export function ScreenshareModal() {
	const {
		open,
		handleSelectSource,
	} = useRedux();
	const sources = useScreensharingSources();
	const { t } = useTranslation();

	return !!(open && sources.length > 0) && (
		<Modal open>
			<ModalContent>
				<ModalTitle>{t('dialog.screenshare.announcement')}</ModalTitle>
				<ScreenshareSources>
					{sources.map(({ id, name, thumbnail }) => (
						<ScreenshareSource
							key={id}
							onClick={() => handleSelectSource(id)}
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
