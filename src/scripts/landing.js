import { EventEmitter } from 'events';
import i18n from '../i18n';
import { connect } from '../store';
import { normalizeServerUrl } from '../utils';


let state = {
	visible: true,
	error: null,
	validating: false,
	offline: true,
};

const events = new EventEmitter();

let root;
let form;
let serverUrlField;
let errorPane;
let connectButton;

const defaultInstance = 'https://open.rocket.chat';

const update = () => {
	if (!root) {
		return;
	}

	const {
		visible,
		error,
		validating,
		offline,
	} = state;

	root.classList.toggle('landing--visible', visible);
	root.classList.toggle('landing--offline', offline);

	errorPane.classList.toggle('landing__form-error--visible', offline || !!error);
	errorPane.innerHTML = offline ? i18n.__('error.offline') : (error || '');
	serverUrlField.classList.toggle('wrong', !!error);

	connectButton.value = validating ? i18n.__('landing.validating') : i18n.__('landing.connect');
	connectButton.disabled = validating;
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

const handleSubmit = async (event) => {
	event.preventDefault();

	setState({ error: null, validating: true });

	const value = serverUrlField.value.trim() || defaultInstance;

	const tries = [
		value,
		(
			!/(^https?:\/\/)|(\.)|(^([^:]+:[^@]+@)?localhost(:\d+)?$)/.test(value) ?
				`https://${ value }.rocket.chat` :
				null
		),
	].filter(Boolean).map(normalizeServerUrl);

	let result;
	for (const serverUrl of tries) {
		serverUrlField.value = serverUrl;

		result = await new Promise((resolve) => events.emit('add-server', serverUrl, resolve));

		if (result === 'valid') {
			serverUrlField.value = '';
			setState({ error: null, validating: false });
			return;
		}
	}

	switch (result) {
		case 'basic-auth':
			setState({ error: i18n.__('error.authNeeded', { auth: 'username:password@host' }), validating: false });
			break;

		case 'invalid':
			setState({ error: i18n.__('error.noValidServerFound'), validating: false });
			break;

		case 'timeout':
			setState({ error: i18n.__('error.connectTimeout'), validating: false });
			break;
	}
};

const handleConnectionStatus = () => {
	setState({ offline: !navigator.onLine });
};

let disconnect;

const mount = () => {
	root = document.querySelector('.landing');
	form = root.querySelector('.landing__form');
	serverUrlField = form.querySelector('.landing__form-host-field');
	errorPane = form.querySelector('.landing__form-error');
	connectButton = form.querySelector('.landing__form-submit-button');

	root.querySelector('.landing__form-prompt').innerHTML = i18n.__('landing.inputUrl');
	connectButton.innerHTML = i18n.__('landing.connect');
	serverUrlField.placeholder = defaultInstance;

	serverUrlField.focus();

	form.addEventListener('submit', handleSubmit);

	window.addEventListener('online', handleConnectionStatus);
	window.addEventListener('offline', handleConnectionStatus);
	handleConnectionStatus();

	disconnect = connect(({
		loading,
		view,
	}) => ({
		visible: !loading && view === 'landing',
	}))(setState);
};

const unmount = () => {
	disconnect();
	events.removeAllListeners();
};

export const landing = Object.assign(events, {
	mount,
	unmount,
});
