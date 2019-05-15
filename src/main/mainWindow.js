import { app, BrowserWindow, screen } from 'electron';
import { store } from '../store';
import { updateWindowState } from '../store/actions';
import { debounce } from '../utils';


export let mainWindow = null;

let hideOnClose = false;

const applyWindowBoundsFromState = async () => {
	let {
		windowState: {
			x,
			y,
			width,
			height,
		},
	} = store.getState();

	if (!x || !y || !width || !height) {
		({ x, y, width, height } = mainWindow.getNormalBounds());
	}

	const isInsideSomeDisplay = screen.getAllDisplays().some(({ workArea }) => (
		x >= workArea.x &&
		y >= workArea.y &&
		x + width <= workArea.x + workArea.width &&
		y + height <= workArea.y + workArea.height
	));

	if (!isInsideSomeDisplay) {
		const { bounds } = screen.getPrimaryDisplay();
		x = (bounds.width - width) / 2;
		y = (bounds.height - height) / 2;
	}

	mainWindow.setBounds({ x, y, width, height });
};

const dispatchWindowState = debounce((windowState) => store.dispatch(updateWindowState(windowState)), 100);

const fetchWindowState = () => {
	const windowState = {};
	({
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
	} = mainWindow.getNormalBounds());
	windowState.isMinimized = mainWindow.isMinimized();
	windowState.isMaximized = mainWindow.isMaximized();
	windowState.isHidden = !mainWindow.isVisible();

	dispatchWindowState(windowState);
};

const handleFocus = () => {
	mainWindow.flashFrame(false);
};

const handleClose = async (event) => {
	event.preventDefault();
	await new Promise((resolve) => {
		if (mainWindow.isFullScreen()) {
			mainWindow.once('leave-full-screen', resolve);
			mainWindow.setFullScreen(false);
			return;
		}
		resolve();
	});
	mainWindow.blur();

	if (!hideOnClose) {
		fetchWindowState();
	}

	switch (process.platform) {
		case 'darwin': {
			mainWindow.hide();
			break;
		}

		case 'linux': {
			if (hideOnClose) {
				mainWindow.hide();
			} else {
				mainWindow.destroy();
			}
			break;
		}

		case 'win32': {
			if (hideOnClose) {
				mainWindow.hide();
			} else {
				mainWindow.minimize();
			}
			break;
		}
	}

	if (hideOnClose) {
		fetchWindowState();
	}
};

const forceFocus = () => {
	mainWindow.showInactive();

	if (mainWindow.isMinimized()) {
		mainWindow.restore();
	}

	mainWindow.focus();
};

const showIfNeeded = () => {
	const {
		windowState: {
			isMaximized,
			isMinimized,
			isHidden,
		},
	} = store.getState();

	if (isMaximized) {
		mainWindow.maximize();
	}

	if (isMinimized) {
		mainWindow.minimize();
	}

	if (hideOnClose) {
		isHidden ? mainWindow.hide() : mainWindow.show();
		return;
	}

	switch (process.platform) {
		case 'darwin': {
			isHidden ? mainWindow.hide() : mainWindow.show();
			break;
		}

		case 'linux':
		case 'win32': {
			if (isHidden) {
				mainWindow.minimize();
				mainWindow.showInactive();
			} else {
				mainWindow.show();
			}
			break;
		}
	}
};

const connectToStore = () => {
	const {
		preferences: {
			hasTray,
		},
	} = store.getState();

	hideOnClose = hasTray;
};

export const createMainWindow = async () => {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		minWidth: 600,
		minHeight: 400,
		titleBarStyle: 'hidden',
		show: false,
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true,
		},
	});

	applyWindowBoundsFromState();

	mainWindow.on('move', fetchWindowState);
	mainWindow.on('resize', fetchWindowState);
	mainWindow.on('minimize', fetchWindowState);
	mainWindow.on('restore', fetchWindowState);
	mainWindow.on('maximize', fetchWindowState);
	mainWindow.on('unmaximize', fetchWindowState);
	mainWindow.on('show', fetchWindowState);
	mainWindow.on('hide', fetchWindowState);
	mainWindow.on('focus', handleFocus);
	mainWindow.on('close', handleClose);

	mainWindow.forceFocus = forceFocus;
	mainWindow.showIfNeeded = showIfNeeded;

	mainWindow.loadFile(`${ app.getAppPath() }/app/public/app.html`);

	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}

	store.subscribe(connectToStore);

	await new Promise((resolve) => mainWindow.once('ready-to-show', resolve));
};
