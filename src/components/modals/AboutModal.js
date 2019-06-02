import styled from '@emotion/styled';
import { remote } from 'electron';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { delay, takeLeading } from 'redux-saga/effects';
import i18n from '../../i18n';
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

const mapStateToProps = (({
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
}));

const mapDispatchToProps = (dispatch) => ({
	onClickCheckForUpdate: () => dispatch(checkForUpdate()),
	onChangeAutoUpdate: ({ target: { checked } }) => dispatch(setAutoUpdate(checked)),
	onClickOk: () => dispatch(hideModal()),
});

export const AboutModal = connect(mapStateToProps, mapDispatchToProps)(
	function AboutModal({
		canUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		checkingUpdate,
		open,
		onClickOk,
		onClickCheckForUpdate,
		onChangeAutoUpdate,
	}) {
		const [checkingMessage, setCheckingMessage] = useState(null);

		useSaga(function *watchUpdatesActions() {
			yield takeLeading(CHECKING_FOR_UPDATE_ERRORED, function *checkingForUpdateErrored() {
				setCheckingMessage(i18n.__('dialog.about.errorWhileLookingForUpdates'));
				yield delay(5000);
				setCheckingMessage(null);
			});

			yield takeLeading(UPDATE_NOT_AVAILABLE, function *updateNotAvailable() {
				setCheckingMessage(i18n.__('dialog.about.noUpdatesAvailable'));
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
							{i18n.__('dialog.about.version')}
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
									<Button primary onClick={onClickCheckForUpdate}>
										{i18n.__('dialog.about.checkUpdates')}
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
									onChange={onChangeAutoUpdate}
								/>
								<span>{i18n.__('dialog.about.checkUpdatesOnStart')}</span>
							</SetAutoUpdateLabel>
						</UpdateSection>
					)}

					<CopyrightWrapper>
						{i18n.__('dialog.about.copyright', { copyright })}
					</CopyrightWrapper>
				</ModalContent>

				<ModalActions>
					<Button primary onClick={onClickOk}>{i18n.__('dialog.about.ok')}</Button>
				</ModalActions>
			</Modal>
		);
	}
);
