import { remote } from 'electron';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { store } from '../store';
const { app } = remote;


let state = {
	visible: false,
	newVersion: null,
};

const events = new EventEmitter();

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

const handleSkipClick = () => {
	const { newVersion } = state;
	events.emit('skip', newVersion);
};

const handleRemindLaterClick = () => {
	const { newVersion } = state;
	events.emit('remind-later', newVersion);
};

const handleInstallClick = () => {
	events.emit('install');
};

const connectToStore = () => {
	const {
		modal,
		update: {
			version,
		},
	} = store.getState();

	setState({
		visible: modal === 'update',
		newVersion: version,
	});
};

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
	store.subscribe(connectToStore);
};

export const updateModal = Object.assign(events, {
	mount,
});
