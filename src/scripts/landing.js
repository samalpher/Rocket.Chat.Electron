import { EventEmitter } from 'events';
import i18n from '../i18n';
import { normalizeServerUrl } from '../utils';


let state = {
	visible: true,
	error: null,
	validating: false,
};
const events = new EventEmitter();

let root;
let form;
let errorPane;
let serverUrlField;
let connectButton;

const defaultInstance = 'https://open.rocket.chat';

const update = () => {
	const {
		visible,
		error,
		validating,
	} = state;

	root.classList.toggle('hide', !visible);

	errorPane.style.display = error ? 'block' : 'none';
	errorPane.innerHTML = error || '';
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

		result = await new Promise((resolve) => events.emit('validate', serverUrl, resolve));

		if (result === 'valid') {
			serverUrlField.value = '';
			setState({ error: null, validating: false });
			events.emit('add-server', serverUrl);
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

const mount = () => {
	root = document.querySelector('.landing-page');
	form = root.querySelector('#login-card');
	errorPane = form.querySelector('#invalidUrl');
	serverUrlField = form.querySelector('[name="host"]');
	connectButton = form.querySelector('[type="submit"]');

	root.querySelector('#login-card .connect__prompt').innerHTML = i18n.__('landing.inputUrl');
	errorPane.innerHTML = i18n.__('error.noValidServerFound');
	root.querySelector('#login-card .connect__error').innerHTML = i18n.__('error.offline');
	connectButton.innerHTML = i18n.__('landing.connect');
	serverUrlField.placeholder = defaultInstance;

	serverUrlField.focus();

	form.addEventListener('submit', handleSubmit);
};

export const landing = Object.assign(events, {
	mount,
	setState,
});
