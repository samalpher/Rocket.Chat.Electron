import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalTitle } from '../Modal';
import { useModal, useScreensharingSources } from './hooks';
import {
	ModalContent,
	ScreenshareSources,
	ScreenshareSource,
	ScreenshareSourceThumbnail,
	ScreenshareSourceName,
} from './styles';


export function ScreenshareModal() {
	const [isOpen] = useModal();

	const [sources, selectSource] = useScreensharingSources();

	const { t } = useTranslation();

	return !!(isOpen && sources.length > 0) && (
		<Modal open>
			<ModalContent>
				<ModalTitle>{t('dialog.screenshare.announcement')}</ModalTitle>
				<ScreenshareSources>
					{sources.map(({ id, name, thumbnail }) => (
						<ScreenshareSource
							key={id}
							onClick={() => selectSource(id)}
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
