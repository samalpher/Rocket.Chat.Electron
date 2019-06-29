import { app, Menu, BrowserWindow } from 'electron';
import { t } from 'i18next';
import { getStore } from '../../store';
import { menuItemClicked } from '../../../store/actions/menus';
import { connect } from '../../../utils/store';


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
		label: process.platform === 'darwin' ? appName : t('menus.fileMenu'),
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.about', { appName }),
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
					label: t('menus.addNewServer'),
					accelerator: 'CommandOrControl+N',
					click: () => onAction('add-new-server'),
				},
			] : []),
			{
				type: 'separator',
			},
			{
				label: t('menus.quit', { appName }),
				accelerator: 'CommandOrControl+Q',
				click: () => onAction('quit'),
			},
		],
	},
	{
		label: t('menus.editMenu'),
		submenu: [
			{
				label: t('menus.undo'),
				accelerator: 'CommandOrControl+Z',
				enabled: canUndo,
				click: () => onAction('undo'),
			},
			{
				label: t('menus.redo'),
				accelerator: process.platform === 'win32' ? 'Control+Y' : 'CommandOrControl+Shift+Z',
				enabled: canRedo,
				click: () => onAction('redo'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.cut'),
				accelerator: 'CommandOrControl+X',
				enabled: canCut,
				click: () => onAction('cut'),
			},
			{
				label: t('menus.copy'),
				accelerator: 'CommandOrControl+C',
				enabled: canCopy,
				click: () => onAction('copy'),
			},
			{
				label: t('menus.paste'),
				accelerator: 'CommandOrControl+V',
				enabled: canPaste,
				click: () => onAction('paste'),
			},
			{
				label: t('menus.selectAll'),
				accelerator: 'CommandOrControl+A',
				enabled: canSelectAll,
				click: () => onAction('select-all'),
			},
		],
	},
	{
		label: t('menus.viewMenu'),
		submenu: [
			{
				label: t('menus.reload'),
				accelerator: 'CommandOrControl+R',
				click: () => onAction('reload-server'),
			},
			{
				label: t('menus.reloadIgnoringCache'),
				click: () => onAction('reload-server', { ignoringCache: true }),
			},
			{
				label: t('menus.clearTrustedCertificates'),
				click: () => onAction('reload-server', { ignoringCache: true, clearCertificates: true }),
			},
			{
				label: t('menus.openDevTools'),
				accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
				click: () => onAction('open-devtools-for-server'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.back'),
				accelerator: process.platform === 'darwin' ? 'Command+[' : 'Alt+Left',
				enabled: canGoBack,
				click: () => onAction('go-back'),
			},
			{
				label: t('menus.forward'),
				accelerator: process.platform === 'darwin' ? 'Command+]' : 'Alt+Right',
				enabled: canGoForward,
				click: () => onAction('go-forward'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.showTrayIcon'),
				type: 'checkbox',
				checked: hasTray,
				click: ({ checked }) => onAction('toggle', 'hasTray', checked),
			},
			...(process.platform !== 'darwin' ? [
				{
					label: t('menus.showMenuBar'),
					type: 'checkbox',
					checked: hasMenus,
					click: ({ checked }) => onAction('toggle', 'hasMenus', checked),
				},
			] : []),
			{
				label: t('menus.showServerList'),
				type: 'checkbox',
				checked: hasSidebar,
				click: ({ checked }) => onAction('toggle', 'hasSidebar', checked),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.resetZoom'),
				accelerator: 'CommandOrControl+0',
				click: () => onAction('reset-zoom'),
			},
			{
				label: t('menus.zoomIn'),
				accelerator: 'CommandOrControl+Plus',
				click: () => onAction('zoom-in'),
			},
			{
				label: t('menus.zoomOut'),
				accelerator: 'CommandOrControl+-',
				click: () => onAction('zoom-out'),
			},
		],
	},
	{
		label: t('menus.windowMenu'),
		role: 'window',
		submenu: [
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.addNewServer'),
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
				label: t('menus.reload'),
				accelerator: 'CommandOrControl+Shift+R',
				click: () => onAction('reload-app'),
			},
			{
				label: t('menus.toggleDevTools'),
				click: () => onAction('toggle-devtools'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.showOnUnreadMessage'),
				type: 'checkbox',
				checked: showWindowOnUnreadChanged,
				click: ({ checked }) => onAction('toggle', 'showWindowOnUnreadChanged', checked),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.minimize'),
				accelerator: 'CommandOrControl+M',
				role: 'minimize',
			},
			...(process.platform === 'darwin' ? [
				{
					label: t('menus.showFullScreen'),
					accelerator: 'Control+Command+F',
					role: 'toggleFullScreen',
				},
			] : []),
			{
				label: t('menus.close'),
				accelerator: 'CommandOrControl+W',
				role: 'close',
			},
		],
	},
	{
		label: t('menus.helpMenu'),
		role: 'help',
		submenu: [
			{
				label: t('menus.documentation'),
				click: () => onAction('open-url', 'https://rocket.chat/docs'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.reportIssue'),
				click: () => onAction('open-url', 'https://github.com/RocketChat/Rocket.Chat.Electron/issues/new'),
			},
			{
				label: t('menus.resetUserData'),
				click: () => onAction('reset-app-data'),
			},
			{
				type: 'separator',
			},
			{
				label: t('menus.learnMore'),
				click: () => onAction('open-url', 'https://rocket.chat'),
			},
			...(process.platform !== 'darwin' ? [
				{
					label: t('menus.about', { appName }),
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
		const { mainWindow, hasMenus } = props;
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
	mainWindow: {
		id,
	},
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
	mainWindow: BrowserWindow.fromId(id),
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
	onAction: (action, ...args) => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(menuItemClicked(action, ...args)));
	},
});

const mount = () => {
	disconnect = connect(getStore(), mapStateToProps)(setProps);
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
				label: t('menus.quit', { appName: app.getName() }),
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
