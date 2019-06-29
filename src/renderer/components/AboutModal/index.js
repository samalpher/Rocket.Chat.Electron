import { remote } from 'electron';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { copyright } from '../../../../package.json';
import { Button } from '../Button';
import { LoadingIndicator } from '../LoadingIndicator';
import { Modal, ModalActions } from '../Modal';
import { RocketChatLogo } from '../RocketChatLogo';
import { useModal, useUpdate } from './hooks';
import {
	ModalContent,
	AppInfoSection,
	AppVersionOuter,
	AppVersionInner,
	UpdateCheckIndicatorWrapper,
	UpdateCheckIndicatorMessage,
	SetAutoUpdateLabel,
	SetAutoUpdateInput,
	UpdateSection,
	CopyrightWrapper,
} from './styles';
const { app } = remote;


export function AboutModal() {
	const [isOpen, close] = useModal();

	const {
		canUpdate,
		checking: checkingUpdate,
		checkingMessage,
		checkForUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		setAutoUpdate,
	} = useUpdate();

	const handleClickCheckForUpdate = () => {
		checkForUpdate();
	};

	const handleChangeAutoUpdate = ({ target: { checked } }) => {
		setAutoUpdate(checked);
	};

	const handleClickOk = () => {
		close();
	};

	const { t } = useTranslation();

	return isOpen && (
		<Modal open>
			<ModalContent>
				<AppInfoSection>
					<RocketChatLogo />

					<AppVersionOuter>
						{t('dialog.about.version')}
						&nbsp;
						<AppVersionInner>
							{app.getVersion()}
						</AppVersionInner>
					</AppVersionOuter>
				</AppInfoSection>

				{canUpdate && (
					<UpdateSection>
						<UpdateCheckIndicatorWrapper>
							{!checkingUpdate && !checkingMessage && (
								<Button primary onClick={handleClickCheckForUpdate}>
									{t('dialog.about.checkUpdates')}
								</Button>
							)}

							{checkingUpdate && !checkingMessage && <LoadingIndicator />}

							{checkingMessage && (
								<UpdateCheckIndicatorMessage>
									{checkingMessage}
								</UpdateCheckIndicatorMessage>
							)}
						</UpdateCheckIndicatorWrapper>

						<SetAutoUpdateLabel>
							<SetAutoUpdateInput
								type="checkbox"
								checked={canAutoUpdate}
								disabled={!canSetAutoUpdate}
								onChange={handleChangeAutoUpdate}
							/>
							<span>{t('dialog.about.checkUpdatesOnStart')}</span>
						</SetAutoUpdateLabel>
					</UpdateSection>
				)}

				<CopyrightWrapper>
					{t('dialog.about.copyright', { copyright })}
				</CopyrightWrapper>
			</ModalContent>

			<ModalActions>
				<Button primary onClick={handleClickOk}>{t('dialog.about.ok')}</Button>
			</ModalActions>
		</Modal>
	);
}
