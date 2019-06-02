/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { cancel, delay, fork, takeLeading } from 'redux-saga/effects';
import i18n from '../../i18n';
import { copyright } from '../../../package.json';
import { sagaMiddleware } from '../../store';
import {
	CHECKING_FOR_UPDATE_ERRORED,
	UPDATE_NOT_AVAILABLE,
	checkForUpdate,
	hideModal,
	setAutoUpdate,
} from '../../store/actions';
import { Button } from '../ui/Button';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { Modal, ModalActions } from '../ui/Modal';
import { RocketChatLogo } from '../ui/RocketChatLogo';
import { useState, useEffect } from 'react';
const { app } = remote;


const AppVersion = () => (
	<div
		css={css`
			font-size: 0.75rem;
			text-align: center;
		`}
	>
		{i18n.__('dialog.about.version')}
		&nbsp;
		<span
			css={css`
				cursor: text;
				user-select: text;
				font-weight: bold;
			`}
		>
			{app.getVersion()}
		</span>
	</div>
);

const AppInfoSection = () => (
	<section
		css={css`
			display: flex;
			flex-direction: column;
			flex: 1;
			justify-content: center;
			margin: 2rem 0;
		`}
	>
		<RocketChatLogo />
		<AppVersion />
	</section>
);

const UpdateCheckIndicator = ({ checking, message, onClickCheckForUpdate }) => (
	<div
		css={css`
			display: flex;
			flex-flow: column nowrap;
			height: 2.5rem;
		`}
	>
		{!checking && !message && (
			<Button primary onClick={onClickCheckForUpdate}>
				{i18n.__('dialog.about.checkUpdates')}
			</Button>
		)}

		{checking && !message && <LoadingIndicator />}

		{message && (
			<div
				css={css`
					color: var(--color-dark-30);
					text-align: center;
				`}
			>
				{message}
			</div>
		)}
	</div>
);

const SetAutoUpdateField = ({ checked, enabled, onChange }) => (
	<label
		css={css`
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			justify-content: center;
			margin: 1rem 0;
			font-size: 0.9rem;
		`}
	>
		<input
			type="checkbox"
			checked={checked}
			disabled={!enabled}
			onChange={onChange}
			css={css`
				margin: 0 0.5rem;
			`}
		/>
		<span>{i18n.__('dialog.about.checkUpdatesOnStart')}</span>
	</label>
);

const UpdateSection = ({
	checkingUpdate,
	checkingMessage,
	canAutoUpdate,
	canSetAutoUpdate,
	onClickCheckForUpdate,
	onChangeAutoUpdate,
}) => (
	<section
		css={css`
			display: flex;
			flex-flow: column nowrap;
			flex: 1;
			justify-content: center;
		`}
	>
		<UpdateCheckIndicator
			checking={checkingUpdate}
			message={checkingMessage}
			onClickCheckForUpdate={onClickCheckForUpdate}
		/>
		<SetAutoUpdateField
			checked={canAutoUpdate}
			enabled={canSetAutoUpdate}
			onChange={onChangeAutoUpdate}
		/>
	</section>
);

const Copyright = () => (
	<div
		css={css`
			margin: 0 auto;
			font-size: 0.75rem;
			text-align: center;
		`}
	>
		{i18n.__('dialog.about.copyright', { copyright })}
	</div>
);

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

		function *watchUpdatesActions() {
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
		}

		let sagaTask;

		useEffect(() => {
			sagaTask = sagaMiddleware.run(function *() {
				sagaTask = yield fork(watchUpdatesActions);
			});

			return () => {
				sagaMiddleware.run(function *() {
					yield cancel(sagaTask);
				});
			};
		}, []);

		return open && (
			<Modal open>
				<div
					css={css`
						max-width: 400px;
					`}
				>
					<AppInfoSection />

					{canUpdate && (
						<UpdateSection
							checkingUpdate={checkingUpdate}
							checkingMessage={checkingMessage}
							canAutoUpdate={canAutoUpdate}
							canSetAutoUpdate={canSetAutoUpdate}
							onClickCheckForUpdate={onClickCheckForUpdate}
							onChangeAutoUpdate={onChangeAutoUpdate}
						/>
					)}

					<Copyright />
				</div>

				<ModalActions>
					<Button primary onClick={onClickOk}>{i18n.__('dialog.about.ok')}</Button>
				</ModalActions>
			</Modal>
		);
	}
);
