import { remote } from 'electron';
import { EventEmitter } from 'events';
import { copyright } from '../../package.json';
import i18n from '../i18n';
import { connect } from '../store';
const { app } = remote;


let state = {
	visible: false,
	canUpdate: false,
	canAutoUpdate: false,
	canSetAutoUpdate: false,
	checkingUpdate: false,
	checkingMessage: null,
};

const events = new EventEmitter();

let root;

const update = () => {
	const {
		visible,
		canUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		checkingUpdate,
		checkingMessage,
	} = state;

	if (canUpdate) {
		root.querySelector('.updates').classList.remove('hidden');
	} else {
		root.querySelector('.updates').classList.add('hidden');
	}

	if (canAutoUpdate) {
		root.querySelector('.check-for-updates-on-start').setAttribute('checked', 'checked');
	} else {
		root.querySelector('.check-for-updates-on-start').removeAttribute('checked');
	}

	if (canSetAutoUpdate) {
		root.querySelector('.check-for-updates-on-start').removeAttribute('disabled');
	} else {
		root.querySelector('.check-for-updates-on-start').setAttribute('disabled', 'disabled');
	}

	if (checkingUpdate) {
		root.querySelector('.check-for-updates').setAttribute('disabled', 'disabled');
		root.querySelector('.check-for-updates').classList.add('hidden');
		root.querySelector('.checking-for-updates').classList.remove('hidden');
	} else {
		root.querySelector('.check-for-updates').removeAttribute('disabled');
		root.querySelector('.check-for-updates').classList.remove('hidden');
		root.querySelector('.checking-for-updates').classList.add('hidden');
	}

	if (checkingMessage) {
		root.querySelector('.checking-for-updates .message').innerText = checkingMessage;
		root.querySelector('.checking-for-updates').classList.add('message-shown');
	} else {
		root.querySelector('.checking-for-updates .message').innerText = '';
		root.querySelector('.checking-for-updates').classList.remove('message-shown');
	}

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

const handleCheckForUpdatesClick = () => {
	events.emit('check-for-updates');
};

const handleCheckForUpdatesOnStartChange = ({ target: { checked } }) => {
	events.emit('set-check-for-updates-on-start', checked);
};

const handleOkClick = () => {
	events.emit('close');
};

let disconnect;

const mount = () => {
	root = document.querySelector('.about-modal');

	root.querySelector('.app-version').innerHTML = `${ i18n.__('dialog.about.version') } <span class="version">${ app.getVersion() }</span>`;
	root.querySelector('.check-for-updates').innerText = i18n.__('dialog.about.checkUpdates');
	root.querySelector('.check-for-updates-on-start + span').innerText = i18n.__('dialog.about.checkUpdatesOnStart');
	root.querySelector('.copyright').innerText = i18n.__('dialog.about.copyright', { copyright });
	root.querySelector('.ok').innerText = i18n.__('dialog.about.ok');

	root.querySelector('.check-for-updates').addEventListener('click', handleCheckForUpdatesClick, false);
	root.querySelector('.check-for-updates-on-start').addEventListener('change', handleCheckForUpdatesOnStartChange, false);
	root.querySelector('.ok').addEventListener('click', handleOkClick, false);

	update();
	disconnect = connect(({
		modal,
		update: {
			canUpdate,
			canAutoUpdate,
			canSetAutoUpdate,
			checking,
		},
	}) => ({
		canUpdate,
		canAutoUpdate,
		canSetAutoUpdate,
		checkingUpdate: checking,
		visible: modal === 'about',
	}))(setState);
};

const unmount = () => {
	disconnect();
	events.removeAllListeners();
};

export const aboutModal = Object.assign(events, {
	mount,
	unmount,
});
