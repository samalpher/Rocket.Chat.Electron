import { desktopCapturer } from 'electron';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { store } from '../store';


let state = {
	visible: false,
	url: null,
};

const events = new EventEmitter();

let root;

const update = (previousState = {}) => {
	const {
		visible,
		url,
	} = state;

	if (!previousState.visible && visible) {
		const template = root.querySelector('.screenshare-source-template');

		desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
			if (error) {
				throw error;
			}

			root.querySelector('.screenshare-sources').innerHTML = '';

			sources.forEach(({ id, name, thumbnail }) => {
				const sourceView = document.importNode(template.content, true);

				sourceView.querySelector('.screenshare-source-thumbnail img').setAttribute('alt', name);
				sourceView.querySelector('.screenshare-source-thumbnail img').setAttribute('src', thumbnail.toDataURL());
				sourceView.querySelector('.screenshare-source-name').textContent = name;

				sourceView.querySelector('.screenshare-source')
					.addEventListener('click', () => events.emit('select-source', { id, url }), false);

				root.querySelector('.screenshare-sources').appendChild(sourceView);
			});
		});
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

const connectToStore = () => {
	const {
		modal,
		screensharing,
	} = store.getState();

	setState({
		visible: modal === 'screenshare',
		url: screensharing,
	});
};

const mount = () => {
	root = document.querySelector('.screenshare-modal');

	root.querySelector('.screenshare-title').innerText = i18n.__('dialog.screenshare.announcement');

	update();
	store.subscribe(connectToStore);
};

export const screenshareModal = Object.assign(events, {
	mount,
});
