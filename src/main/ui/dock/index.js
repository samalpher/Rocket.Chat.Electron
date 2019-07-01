import { BrowserWindow } from 'electron';
import { connect } from '../../../utils/store';
import { getStore } from '../../store';
import { getTrayIconImage, getAppIconImage } from '../icons';


let props = {
	badge: null,
	hasTray: false,
	mainWindow: null,
};

const render = () => {
	const { badge, mainWindow } = props;

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
	disconnect = connect(getStore(), mapStateToProps)(setProps);
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
