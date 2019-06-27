import styled from '@emotion/styled';
import { remote } from 'electron';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { delay, takeLeading } from 'redux-saga/effects';
import { copyright } from '../../../package.json';
import {
	CHECKING_FOR_UPDATE_ERRORED,
	UPDATE_NOT_AVAILABLE,
	checkForUpdate,
	hideModal,
	setAutoUpdate,
} from '../../store/actions';
import { useSaga } from '../hooks';
import { Button } from '../ui/Button';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { Modal, ModalActions } from '../ui/Modal';
import { RocketChatLogo } from '../ui/RocketChatLogo';
const { app } = remote;


const ModalContent = styled.div`
	max-width: 400px;
`;

const AppInfoSection = styled.section`
	display: flex;
	flex-direction: column;
	flex: 1;
	justify-content: center;
	margin: 2rem 0;
`;

const AppVersionOuter = styled.div`
	font-size: 0.75rem;
	text-align: center;
`;

const AppVersionInner = styled.span`
	cursor: text;
	user-select: text;
	font-weight: bold;
`;

const UpdateCheckIndicatorWrapper = styled.div`
	display: flex;
	flex-flow: column nowrap;
	height: 2.5rem;
`;

const UpdateCheckIndicatorMessage = styled.div`
	color: var(--color-dark-30);
	text-align: center;
`;

const SetAutoUpdateLabel = styled.label`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	margin: 1rem 0;
	font-size: 0.9rem;
`;

const SetAutoUpdateInput = styled.input`
	margin: 0 0.5rem;
`;

const UpdateSection = styled.section`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	justify-content: center;
`;

const CopyrightWrapper = styled.div`
	margin: 0 auto;
	font-size: 0.75rem;
	text-align: center;
`;

const useRedux = () => {
	const state = useSelector((({
		modal,
		update: {
			configuration: {
				canUpdate,
				canAutoUpdate,
				canSetAutoUpdate,
			},
			checking,
		},
	}) => ({
		canUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		checkingUpdate: !!checking,
		open: modal === 'about',
	})));

	const dispatch = useDispatch();

	const handleClickCheckForUpdate = () => {
		dispatch(checkForUpdate());
	};

	const handleChangeAutoUpdate = ({ target: { checked } }) => {
		dispatch(setAutoUpdate(checked));
	};

	const handleClickOk = () => {
		dispatch(hideModal());
	};

	return {
		...state,
		handleClickCheckForUpdate,
		handleChangeAutoUpdate,
		handleClickOk,
	};
};

export function AboutModal() {
	const {
		canUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		checkingUpdate,
		open,
		handleClickOk,
		handleClickCheckForUpdate,
		handleChangeAutoUpdate,
	} = useRedux();
	const [checkingMessage, setCheckingMessage] = useState(null);
	const { t } = useTranslation();

	useSaga(function *watchUpdatesActions() {
		yield takeLeading(CHECKING_FOR_UPDATE_ERRORED, function *checkingForUpdateErrored() {
			setCheckingMessage(t('dialog.about.errorWhileLookingForUpdates'));
			yield delay(5000);
			setCheckingMessage(null);
		});

		yield takeLeading(UPDATE_NOT_AVAILABLE, function *updateNotAvailable() {
			setCheckingMessage(t('dialog.about.noUpdatesAvailable'));
			yield delay(5000);
			setCheckingMessage(null);
		});
	}, []);

	return open && (
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
