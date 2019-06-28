import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { Modal, ModalActions, ModalTitle } from '../Modal';
import { AppVersion } from './AppVersion';
import { useModal, useUpdate } from './hooks';
import {
	ModalContent,
	Message,
	UpdateInfoSection,
	UpdateInfoArrow,
} from './styles';


export function UpdateModal() {
	const [isOpen, close] = useModal();

	const {
		currentVersion,
		newVersion,
		skip,
		install,
	} = useUpdate();

	const { t } = useTranslation();

	const handleClickRemindLater = () => {
		close();
	};

	const handleClickSkip = () => {
		skip();
	};

	const handleClickInstall = () => {
		install();
	};

	return isOpen && (
		<Modal open>
			<ModalContent>
				<ModalTitle>{t('dialog.update.announcement')}</ModalTitle>

				<Message>{t('dialog.update.message')}</Message>

				<UpdateInfoSection>
					<AppVersion
						label={t('dialog.update.currentVersion')}
						version={currentVersion}
						current
					/>

					<UpdateInfoArrow>
						→
					</UpdateInfoArrow>

					<AppVersion
						label={t('dialog.update.newVersion')}
						version={newVersion}
					/>
				</UpdateInfoSection>
			</ModalContent>

			<ModalActions>
				<Button secondary onClick={handleClickSkip}>{t('dialog.update.skip')}</Button>
				<Button secondary onClick={handleClickRemindLater}>{t('dialog.update.remindLater')}</Button>
				<Button primary onClick={handleClickInstall}>{t('dialog.update.install')}</Button>
			</ModalActions>
		</Modal>
	);
}
