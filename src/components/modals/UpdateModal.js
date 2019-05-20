/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { remote } from 'electron';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { Button } from '../ui/Button';
import { Modal, ModalActions, ModalTitle } from '../ui/Modal';
import { skipUpdate, hideModal, downloadUpdate } from '../../store/actions';
const { app, dialog, getCurrentWindow } = remote;


const Content = ({ children, ...props }) => (
	<div
		{...props}
		css={css`
			display: flex;
			flex-flow: column nowrap;
			flex: 1;
			align-items: center;
			justify-content: center;
			margin: 2.5rem 1rem;
		`}
	>
		{children}
	</div>
);

const Title = () => (
	<ModalTitle>{i18n.__('dialog.update.announcement')}</ModalTitle>
);

const Message = () => (
	<p
		css={css`
			margin: 0 0 1rem;
			line-height: normal;
		`}
	>
		{i18n.__('dialog.update.message')}
	</p>
);

const AppVersion = ({ label, version, current = false }) => (
	<div
		css={css`
			flex: 1;
			margin: 1rem;
			text-align: center;
			white-space: nowrap;
			line-height: normal;
		`}
	>
		<div>{label}</div>
		<div
			css={css`
				font-size: 1.5rem;
				font-weight: bold;
				${ current && 'color: var(--primary-color);' }
			`}
		>
			{version || 'x.y.z'}
		</div>
	</div>
);

const UpdateInfo = ({ currentVersion, newVersion }) => (
	<div
		css={css`
			display: flex;
			align-items: center;
		`}
	>
		<AppVersion
			label={i18n.__('dialog.update.currentVersion')}
			version={currentVersion || app.getVersion()}
			current
		/>

		<div
			css={css`
				flex: 1;
				margin: 1rem;
				font-size: 2rem;
			`}
		>
			→
		</div>

		<AppVersion
			label={i18n.__('dialog.update.newVersion')}
			version={newVersion}
		/>
	</div>
);

const mapStateToProps = ({
	modal,
	update: {
		version,
	},
}) => ({
	open: modal === 'update',
	newVersion: version,
});

const warnItWillSkipVersion = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateSkip.title'),
		message: i18n.__('dialog.updateSkip.message'),
		type: 'warning',
		buttons: [i18n.__('dialog.updateSkip.ok')],
		defaultId: 0,
	}, () => resolve());
});

const informItWillDownloadUpdate = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateDownloading.title'),
		message: i18n.__('dialog.updateDownloading.message'),
		type: 'info',
		buttons: [i18n.__('dialog.updateDownloading.ok')],
		defaultId: 0,
	}, () => resolve());
});

const mapDispatchToProps = (dispatch) => ({
	onClickSkip: async () => {
		await warnItWillSkipVersion();
		dispatch(skipUpdate());
	},
	onClickRemindLater: () => {
		dispatch(hideModal());
	},
	onClickInstall: async () => {
		await informItWillDownloadUpdate();
		dispatch(downloadUpdate());
	},
});

export const UpdateModal = connect(mapStateToProps, mapDispatchToProps)(
	function UpdateModal({ open, currentVersion, newVersion, onClickSkip, onClickRemindLater, onClickInstall }) {
		return open && (
			<Modal open>
				<Content>
					<Title />
					<Message />
					<UpdateInfo currentVersion={currentVersion} newVersion={newVersion} />
				</Content>

				<ModalActions>
					<Button secondary onClick={onClickSkip}>{i18n.__('dialog.update.skip')}</Button>
					<Button secondary onClick={onClickRemindLater}>{i18n.__('dialog.update.remindLater')}</Button>
					<Button primary onClick={onClickInstall}>{i18n.__('dialog.update.install')}</Button>
				</ModalActions>
			</Modal>
		);
	}
);
