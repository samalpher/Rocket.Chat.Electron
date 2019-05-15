import { app, Menu, systemPreferences, Tray } from 'electron';
import { EventEmitter } from 'events';
import i18n from '../i18n';
import { connect } from '../store';
import { getTrayIconImage } from './icon';


let state = {
	badge: null,
	windowVisible: true,
	visible: false,
};

const events = new EventEmitter();

let trayIcon = null;
let darwinThemeSubscriberId = null;

const getIconTitle = ({ badge }) => (Number.isInteger(badge) ? String(badge) : '');

const getIconTooltip = ({ badge }) => {
	const appName = app.getName();

	if (badge === '•') {
		return i18n.__('tray.tooltip.unreadMessage', { appName });
	}

	if (Number.isInteger(badge)) {
		return i18n.__('tray.tooltip.unreadMention', { appName, count: badge });
	}

	return i18n.__('tray.tooltip.noUnreadMessage', { appName });
};

const createContextMenuTemplate = ({ windowVisible }) => ([
	{
		label: !windowVisible ? i18n.__('tray.menu.show') : i18n.__('tray.menu.hide'),
		click: () => events.emit('activate', !windowVisible),
	},
	{
		label: i18n.__('tray.menu.quit'),
		click: () => events.emit('quit'),
	},
]);

const createIcon = () => {
	const image = getTrayIconImage({ badge: state.badge });

	if (trayIcon) {
		trayIcon.setImage(image);
		return;
	}

	trayIcon = new Tray(image);

	if (process.platform === 'darwin') {
		darwinThemeSubscriberId = systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
			trayIcon.setImage(getTrayIconImage({ badge: state.badge }));
		});
	}

	trayIcon.on('click', () => events.emit('activate', !state.windowVisible));
	trayIcon.on('right-click', (event, bounds) => trayIcon.popUpContextMenu(undefined, bounds));
};

const destroyIcon = () => {
	if (!trayIcon) {
		return;
	}

	if (process.platform === 'darwin' && darwinThemeSubscriberId) {
		systemPreferences.unsubscribeNotification(darwinThemeSubscriberId);
		darwinThemeSubscriberId = null;
	}


	trayIcon.destroy();
	trayIcon = null;
};

const update = () => {
	if (!state.visible) {
		destroyIcon();
		return;
	}

	createIcon();

	trayIcon.setToolTip(getIconTooltip(state));

	if (process.platform === 'darwin') {
		trayIcon.setTitle(getIconTitle(state));
	}

	const template = createContextMenuTemplate(state, events);
	const menu = Menu.buildFromTemplate(template);
	trayIcon.setContextMenu(menu);
};

const setState = (partialState) => {
	const previousState = state;
	state = {
		...state,
		...partialState,
	};
	update(previousState);
};

let disconnect;

const mount = () => {
	update();
	disconnect = connect(({
		windowVisible,
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

		return ({
			badge,
			windowVisible,
			visible: hasTray,
		});
	})(setState);
};

const unmount = () => {
	disconnect();
	events.removeAllListeners();
	destroyIcon();
};

export const tray = Object.assign(events, {
	mount,
	unmount,
});
