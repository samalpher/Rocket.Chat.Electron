import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { remote } from 'electron';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/Button';
import { Modal, ModalActions, ModalTitle } from '../ui/Modal';
import { skipUpdate, hideModal, downloadUpdate } from '../../store/actions';
const { app, dialog, getCurrentWindow } = remote;


const ModalContent = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	align-items: center;
	justify-content: center;
	margin: 2.5rem 1rem;
`;

const Message = styled.p`
	margin: 0 0 1rem;
	line-height: normal;
`;

const UpdateInfoSection = styled.section`
	display: flex;
	align-items: center;
`;

const AppVersionOuter = styled.div`
	flex: 1;
	margin: 1rem;
	text-align: center;
	white-space: nowrap;
	line-height: normal;
`;

const AppVersionInner = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	${ ({ current }) => current && css`
		color: var(--color-dark-30);
	` }
`;

const AppVersionUpdateArrow = styled.div`
	flex: 1;
	margin: 1rem;
	font-size: 2rem;
`;

const AppVersion = ({ label, version, current = false }) => (
	<AppVersionOuter>
		<div>{label}</div>
		<AppVersionInner current={current}>
			{version || 'x.y.z'}
		</AppVersionInner>
	</AppVersionOuter>
);

const useRedux = () => {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const state = useSelector(({
		modal,
		update: {
			version,
		},
	}) => ({
		open: modal === 'update',
		newVersion: version,
	}));

	const warnItWillSkipVersion = () => new Promise((resolve) => {
		dialog.showMessageBox(getCurrentWindow(), {
			title: t('dialog.updateSkip.title'),
			message: t('dialog.updateSkip.message'),
			type: 'warning',
			buttons: [t('dialog.updateSkip.ok')],
			defaultId: 0,
		}, () => resolve());
	});

	const informItWillDownloadUpdate = () => new Promise((resolve) => {
		dialog.showMessageBox(getCurrentWindow(), {
			title: t('dialog.updateDownloading.title'),
			message: t('dialog.updateDownloading.message'),
			type: 'info',
			buttons: [t('dialog.updateDownloading.ok')],
			defaultId: 0,
		}, () => resolve());
	});

	const handleClickSkip = async () => {
		await warnItWillSkipVersion();
		dispatch(skipUpdate());
	};

	const handleClickRemindLater = async () => {
		dispatch(hideModal());
	};

	const handleClickInstall = async () => {
		await informItWillDownloadUpdate();
		dispatch(downloadUpdate());
	};

	return {
		...state,
		handleClickSkip,
		handleClickRemindLater,
		handleClickInstall,
	};
};

export function UpdateModal() {
	const {
		open,
		currentVersion,
		newVersion,
		handleClickSkip,
		handleClickRemindLater,
		handleClickInstall,
	} = useRedux();
	const { t } = useTranslation();

	return open && (
		<Modal open>
			<ModalContent>
				<ModalTitle>{t('dialog.update.announcement')}</ModalTitle>

				<Message>{t('dialog.update.message')}</Message>

				<UpdateInfoSection>
					<AppVersion
						label={t('dialog.update.currentVersion')}
						version={currentVersion || app.getVersion()}
						current
					/>

					<AppVersionUpdateArrow>
						→
					</AppVersionUpdateArrow>

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
