import { ipcRenderer, remote } from 'electron';
import React from 'react';
import { __ } from '../i18n';


export default class Update extends React.PureComponent {
	handleSkipVersion = () => {
		remote.dialog.showMessageBox(remote.getCurrentWindow(), {
			type: 'warning',
			title: __('Update_skip'),
			message: __('Update_skip_message'),
			buttons: [__('OK')],
			defaultId: 0,
		}, () => {
			ipcRenderer.send('close-update-dialog');
			ipcRenderer.send('skip-update-version', this.props.newVersion);
		});
	}

	handleRemindMeLater = () => {
		remote.dialog.showMessageBox(remote.getCurrentWindow(), {
			type: 'info',
			title: __('Update_remind'),
			message: __('Update_remind_message'),
			buttons: [__('OK')],
			defaultId: 0,
		}, () => {
			ipcRenderer.send('close-update-dialog');
			ipcRenderer.send('remind-update-later');
		});
	}

	handleInstall = () => {
		remote.dialog.showMessageBox(remote.getCurrentWindow(), {
			type: 'info',
			title: __('Update_downloading'),
			message: __('Update_downloading_message'),
			buttons: [__('OK')],
			defaultId: 0,
		}, () => {
			ipcRenderer.send('close-update-dialog');
			ipcRenderer.send('download-update');
		});
	}

	componentDidMount() {
		document.title = __('Update_Available');
	}

	render = () => (
		<div className="update__wrapper">
			<div className="update-content">
				<h1 className="update-title">{ __('Update_Available_New') }</h1>
				<p className="update-message">{ __('Update_Available_message') }</p>

				<div className="update-info">
					<div className="app-version current-version">
						<div className="app-version-label">{ __('Current_Version') }</div>
						<div className="app-version-value">{ this.props.currentVersion }</div>
					</div>
					<div className="update-arrow">→</div>
					<div className="app-version new-version">
						<div className="app-version-label">{ __('New_Version') }</div>
						<div className="app-version-value">{ this.props.newVersion }</div>
					</div>
				</div>
			</div>

			<div className="update-actions">
				<button className="update-skip-action button secondary" onClick={ this.handleSkipVersion }>
					{ __('Update_skip_version') }
				</button>
				<button className="update-remind-later-action button secondary" onClick={ this.handleRemindMeLater }>
					{ __('Update_skip_remind') }
				</button>
				<button autoFocus className="update-install-action button primary" onClick={ this.handleInstall }>
					{ __('Update_Install') }
				</button>
			</div>
		</div>
	)
}
