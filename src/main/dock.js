import { app } from 'electron';
import { EventEmitter } from 'events';
import { store } from '../store';
import { mainWindow } from './mainWindow';
import { getTrayIconImage, getAppIconImage } from './icon';


let state = {
	badge: null,
	hasTray: false,
};

const events = new EventEmitter();

const getBadgeText = ({ badge }) => {
	if (badge === '•') {
		return '•';
	}

	if (Number.isInteger(badge)) {
		return String(badge);
	}

	return '';
};

const update = async (previousState = {}) => {
	if (process.platform === 'darwin') {
		app.dock.setBadge(getBadgeText(state));
		const count = Number.isInteger(state.badge) ? state.badge : 0;
		const previousCount = Number.isInteger(previousState.badge) ? state.badge : 0;
		if (count > 0 && previousCount === 0) {
			app.dock.bounce();
		}
	}

	if (process.platform === 'linux' || process.platform === 'win32') {
		const { hasTray } = state;
		const image = hasTray ? getAppIconImage() : getTrayIconImage({ badge: state.badge });
		mainWindow.setIcon(image);
	}

	if (!mainWindow.isFocused()) {
		const count = Number.isInteger(state.badge) ? state.badge : 0;
		mainWindow.flashFrame(count > 0);
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

let unsubscribeFromStore;

const connectToStore = () => {
	const {
		preferences: {
			hasTray,
		},
		servers,
	} = store.getState();

	const badges = servers.map(({ badge }) => badge);
	const mentionCount = (
		badges
			.filter((badge) => Number.isInteger(badge))
			.reduce((sum, count) => sum + count, 0)
	);
	const globalBadge = mentionCount || (badges.some((badge) => !!badge) && '•') || null;

	setState({
		hasTray,
		badge: globalBadge,
	});
};

const mount = () => {
	update();
	unsubscribeFromStore = store.subscribe(connectToStore);
};

const unmount = async () => {
	events.removeAllListeners();
	unsubscribeFromStore();

	mainWindow.setIcon(getAppIconImage());
	mainWindow.flashFrame(false);
};

export const dock = Object.assign(events, {
	mount,
	unmount,
});
