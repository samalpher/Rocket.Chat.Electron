import { app, Menu } from 'electron';
import i18n from '../i18n';
import { connect, store } from '../store';
import { menuItemClicked } from '../store/actions/menus';
import { mainWindow } from './mainWindow';


let props = {};

const createTemplate = ({
	appName,
	servers = [],
	activeServerUrl,
	hasTray,
	hasMenus,
	hasSidebar,
	showWindowOnUnreadChanged,
	canUndo,
	canRedo,
	canCut,
	canCopy,
	canPaste,
	canSelectAll,
	canGoBack,
	canGoForward,
	onAction = () => {},
}) => ([
	{
		label: process.platform === 'darwin' ? appName : i18n.__('menus.fileMenu'),
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: i18n.__('menus.about', { appName }),
					click: () => onAction('about'),
				},
				{
					type: 'separator',
				},
				{
					submenu: [],
					role: 'services',
				},
				{
					type: 'separator',
				},
				{
					accelerator: 'Command+H',
					role: 'hide',
				},
				{
					accelerator: 'Command+Alt+H',
					role: 'hideothers',
				},
				{
					role: 'unhide',
				},
				{
					type: 'separator',
				},
			] : []),
			...(process.platform !== 'darwin' ? [
				{
					label: i18n.__('menus.addNewServer'),
					accelerator: 'CommandOrControl+N',
					click: () => onAction('add-new-server'),
				},
			] : []),
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.quit', { appName }),
				accelerator: 'CommandOrControl+Q',
				click: () => onAction('quit'),
			},
		],
	},
	{
		label: i18n.__('menus.editMenu'),
		submenu: [
			{
				label: i18n.__('menus.undo'),
				accelerator: 'CommandOrControl+Z',
				enabled: canUndo,
				click: () => onAction('undo'),
			},
			{
				label: i18n.__('menus.redo'),
				accelerator: process.platform === 'win32' ? 'Control+Y' : 'CommandOrControl+Shift+Z',
				enabled: canRedo,
				click: () => onAction('redo'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.cut'),
				accelerator: 'CommandOrControl+X',
				enabled: canCut,
				click: () => onAction('cut'),
			},
			{
				label: i18n.__('menus.copy'),
				accelerator: 'CommandOrControl+C',
				enabled: canCopy,
				click: () => onAction('copy'),
			},
			{
				label: i18n.__('menus.paste'),
				accelerator: 'CommandOrControl+V',
				enabled: canPaste,
				click: () => onAction('paste'),
			},
			{
				label: i18n.__('menus.selectAll'),
				accelerator: 'CommandOrControl+A',
				enabled: canSelectAll,
				click: () => onAction('select-all'),
			},
		],
	},
	{
		label: i18n.__('menus.viewMenu'),
		submenu: [
			{
				label: i18n.__('menus.reload'),
				accelerator: 'CommandOrControl+R',
				click: () => onAction('reload-server'),
			},
			{
				label: i18n.__('menus.reloadIgnoringCache'),
				click: () => onAction('reload-server', { ignoringCache: true }),
			},
			{
				label: i18n.__('menus.clearTrustedCertificates'),
				click: () => onAction('reload-server', { ignoringCache: true, clearCertificates: true }),
			},
			{
				label: i18n.__('menus.openDevTools'),
				accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
				click: () => onAction('open-devtools-for-server'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.back'),
				accelerator: process.platform === 'darwin' ? 'Command+[' : 'Alt+Left',
				enabled: canGoBack,
				click: () => onAction('go-back'),
			},
			{
				label: i18n.__('menus.forward'),
				accelerator: process.platform === 'darwin' ? 'Command+]' : 'Alt+Right',
				enabled: canGoForward,
				click: () => onAction('go-forward'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.showTrayIcon'),
				type: 'checkbox',
				checked: hasTray,
				click: ({ checked }) => onAction('toggle', 'hasTray', checked),
			},
			...(process.platform !== 'darwin' ? [
				{
					label: i18n.__('menus.showMenuBar'),
					type: 'checkbox',
					checked: hasMenus,
					click: ({ checked }) => onAction('toggle', 'hasMenus', checked),
				},
			] : []),
			{
				label: i18n.__('menus.showServerList'),
				type: 'checkbox',
				checked: hasSidebar,
				click: ({ checked }) => onAction('toggle', 'hasSidebar', checked),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.resetZoom'),
				accelerator: 'CommandOrControl+0',
				click: () => onAction('reset-zoom'),
			},
			{
				label: i18n.__('menus.zoomIn'),
				accelerator: 'CommandOrControl+Plus',
				click: () => onAction('zoom-in'),
			},
			{
				label: i18n.__('menus.zoomOut'),
				accelerator: 'CommandOrControl+-',
				click: () => onAction('zoom-out'),
			},
		],
	},
	{
		label: i18n.__('menus.windowMenu'),
		role: 'window',
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: i18n.__('menus.addNewServer'),
					accelerator: 'CommandOrControl+N',
					click: () => onAction('add-new-server'),
				},
				{
					type: 'separator',
				},
			] : []),
			...servers.map((server, i) => ({
				label: (server.title && server.title.replace(/&/g, '&&')) || server.url,
				type: server.url === activeServerUrl ? 'radio' : 'normal',
				checked: server.url === activeServerUrl,
				accelerator: `CommandOrControl+${ i + 1 }`,
				click: () => onAction('select-server', server),
			})),
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.reload'),
				accelerator: 'CommandOrControl+Shift+R',
				click: () => onAction('reload-app'),
			},
			{
				label: i18n.__('menus.toggleDevTools'),
				click: () => onAction('toggle-devtools'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.showOnUnreadMessage'),
				type: 'checkbox',
				checked: showWindowOnUnreadChanged,
				click: ({ checked }) => onAction('toggle', 'showWindowOnUnreadChanged', checked),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.minimize'),
				accelerator: 'CommandOrControl+M',
				role: 'minimize',
			},
			...(process.platform === 'darwin' ? [
				{
					label: i18n.__('menus.showFullScreen'),
					accelerator: 'Control+Command+F',
					role: 'toggleFullScreen',
				},
			] : []),
			{
				label: i18n.__('menus.close'),
				accelerator: 'CommandOrControl+W',
				role: 'close',
			},
		],
	},
	{
		label: i18n.__('menus.helpMenu'),
		role: 'help',
		submenu: [
			{
				label: i18n.__('menus.documentation'),
				click: () => onAction('open-url', 'https://rocket.chat/docs'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.reportIssue'),
				click: () => onAction('open-url', 'https://github.com/RocketChat/Rocket.Chat.Electron/issues/new'),
			},
			{
				label: i18n.__('menus.resetAppData'),
				click: () => onAction('reset-app-data'),
			},
			{
				type: 'separator',
			},
			{
				label: i18n.__('menus.learnMore'),
				click: () => onAction('open-url', 'https://rocket.chat'),
			},
			...(process.platform !== 'darwin' ? [
				{
					label: i18n.__('menus.about', { appName }),
					click: () => onAction('about'),
				},
			] : []),
		],
	},
]);

const render = () => {
	const template = createTemplate({ appName: app.getName(), ...props });
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	if (process.platform !== 'darwin') {
		const { hasMenus } = props;
		mainWindow.setAutoHideMenuBar(!hasMenus);
		mainWindow.setMenuBarVisibility(!!hasMenus);
	}
};

const setProps = (newProps) => {
	props = newProps;
	render();
};

let disconnect;

const mapStateToProps = ({
	servers,
	view,
	preferences: {
		hasTray,
		hasMenus,
		hasSidebar,
		showWindowOnUnreadChanged,
	},
	editFlags: {
		canUndo,
		canRedo,
		canCut,
		canCopy,
		canPaste,
		canSelectAll,
	},
	historyFlags: {
		canGoBack,
		canGoForward,
	},
}) => ({
	servers,
	activeServerUrl: view.url,
	hasTray,
	hasMenus,
	hasSidebar,
	showWindowOnUnreadChanged,
	canUndo,
	canRedo,
	canCut,
	canCopy,
	canPaste,
	canSelectAll,
	canGoBack,
	canGoForward,
	onAction: (action, ...args) => store.dispatch(menuItemClicked(action, ...args)),
});

const mount = () => {
	render();

	disconnect = connect(mapStateToProps)(setProps);
};

const unmount = () => {
	disconnect();

	if (process.platform !== 'darwin') {
		Menu.setApplicationMenu(null);
		return;
	}

	const emptyMenuTemplate = [{
		label: app.getName(),
		submenu: [
			{
				label: i18n.__('menus.quit', { appName: app.getName() }),
				accelerator: 'CommandOrControl+Q',
				click: () => app.quit(),
			},
		],
	}];
	Menu.setApplicationMenu(Menu.buildFromTemplate(emptyMenuTemplate));
};

export const menus = {
	mount,
	unmount,
};
