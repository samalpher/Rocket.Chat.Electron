import { app, BrowserWindow } from 'electron';
import { connect } from '../store';
import { getTrayIconImage, getAppIconImage } from './icon';


let props = {
	badge: null,
	hasTray: false,
	mainWindow: null,
};

let state = {
	prevBadge: null,
};

const getBadgeText = (badge) => {
	if (badge === '•') {
		return '•';
	}

	if (Number.isInteger(badge)) {
		return String(badge);
	}

	return '';
};

const render = () => {
	const { badge, mainWindow } = props;
	const { prevBadge } = state;

	if (process.platform === 'darwin') {
		app.dock.setBadge(getBadgeText(badge));
		const count = Number.isInteger(badge) ? badge : 0;
		const previousCount = Number.isInteger(prevBadge) ? prevBadge : 0;
		if (count > 0 && previousCount === 0) {
			app.dock.bounce();
		}
	}

	if (process.platform === 'linux' || process.platform === 'win32') {
		const { hasTray } = props;
		const image = hasTray ? getAppIconImage() : getTrayIconImage({ badge });
		mainWindow.setIcon(image);
	}

	if (!mainWindow.isFocused()) {
		const count = Number.isInteger(badge) ? badge : 0;
		mainWindow.flashFrame(count > 0);
	}
};

const setProps = (newProps) => {
	state = {
		...state,
		prevBadge: newProps.badge,
	};
	props = newProps;
	render();
};

const mapStateToProps = ({
	mainWindow: {
		id,
	},
	preferences: {
		hasTray,
	},
	servers,
}) => {
	const badges = servers.map(({ badge }) => badge);
	const mentionCount = (
		badges
			.filter((badge) => Number.isInteger(badge))
			.reduce((sum, count) => sum + count, 0)
	);
	const badge = mentionCount || (badges.some((badge) => !!badge) && '•') || null;

	const mainWindow = BrowserWindow.fromId(id);

	return ({
		badge,
		hasTray,
		mainWindow,
	});
};

let disconnect;

const mount = () => {
	disconnect = connect(mapStateToProps)(setProps);
};

const unmount = async () => {
	props.mainWindow.setIcon(getAppIconImage());
	props.mainWindow.flashFrame(false);

	disconnect();
};

export const dock = {
	mount,
	unmount,
};
