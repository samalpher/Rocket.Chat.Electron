import { remote } from 'electron';
import i18n from '../i18n';
import { connect, store } from '../store';
import {
	hideModal,
	skipUpdate,
	downloadUpdate,
} from '../store/actions';
const { app, dialog, getCurrentWindow } = remote;


let state = {
	visible: false,
	newVersion: null,
};

let root;

const update = () => {
	const {
		visible,
		newVersion,
	} = state;

	root.querySelector('.new-version .app-version-value').innerText = newVersion;

	if (visible) {
		!root.open && root.showModal();
	} else {
		root.open && root.close();
	}
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

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

const handleSkipClick = async () => {
	await warnItWillSkipVersion();
	store.dispatch(skipUpdate());
};

const handleRemindLaterClick = () => {
	store.dispatch(hideModal());
};

const handleInstallClick = async () => {
	await informItWillDownloadUpdate();
	store.dispatch(downloadUpdate());
};

let disconnect;

const mount = () => {
	root = document.querySelector('.update-modal');

	root.querySelector('.update-title').innerText = i18n.__('dialog.update.announcement');
	root.querySelector('.update-message').innerText = i18n.__('dialog.update.message');
	root.querySelector('.current-version .app-version-label').innerText = i18n.__('dialog.update.currentVersion');
	root.querySelector('.new-version .app-version-label').innerText = i18n.__('dialog.update.newVersion');
	root.querySelector('.update-skip-action').innerText = i18n.__('dialog.update.skip');
	root.querySelector('.update-remind-action').innerText = i18n.__('dialog.update.remindLater');
	root.querySelector('.update-install-action').innerText = i18n.__('dialog.update.install');
	root.querySelector('.current-version .app-version-value').innerText = app.getVersion();

	root.querySelector('.update-skip-action').addEventListener('click', handleSkipClick, false);
	root.querySelector('.update-remind-action').addEventListener('click', handleRemindLaterClick, false);
	root.querySelector('.update-install-action').addEventListener('click', handleInstallClick, false);

	update();
	disconnect = connect(({
		modal,
		update: {
			version,
		},
	}) => ({
		visible: modal === 'update',
		newVersion: version,
	}))(setState);
};

const unmount = () => {
	disconnect();
};

export const updateModal = {
	mount,
	unmount,
};
