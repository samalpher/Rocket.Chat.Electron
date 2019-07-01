import { app, BrowserWindow, screen } from 'electron';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import { getStore, getSaga } from '../store';
import {
	MAIN_WINDOW_STATE_LOADED,
	FOCUS_MAIN_WINDOW,
	SHOW_MAIN_WINDOW,
	HIDE_MAIN_WINDOW,
	DESTROY_MAIN_WINDOW,
	APP_READY,
	mainWindowStateUpdated,
	mainWindowCreated,
	mainWindowStateLoaded,
} from '../../actions';
import { connectUserData } from '../userData/store';
import { loadJson, purgeFile } from '../userData/fileSystem';


let mainWindow = null;

const applyWindowBoundsFromState = function* ({ x, y, width, height }) {
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
		x = Math.round((bounds.width - width) / 2);
		y = Math.round((bounds.height - height) / 2);
	}

	mainWindow.setBounds({ x, y, width, height });
};

const fetchWindowState = async () => (await getSaga()).run(function* fetchWindowState() {
	if (mainWindow.isDestroyed()) {
		return;
	}

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

	yield put(mainWindowStateUpdated(windowState));
});

const handleFocus = () => {
	mainWindow.flashFrame(false);
};

const handleClose = async (event) => (await getSaga()).run(function* handleClose() {
	event.preventDefault();
	yield call(() => new Promise((resolve) => {
		if (mainWindow.isFullScreen()) {
			mainWindow.once('leave-full-screen', resolve);
			mainWindow.setFullScreen(false);
			return;
		}
		resolve();
	}));
	mainWindow.blur();

	const {
		preferences: {
			hasTray: hideOnClose,
		},
	} = yield select();

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
});

const showIfNeeded = function* () {
	const {
		preferences: {
			hasTray: hideOnClose,
		},
		mainWindow: {
			isMaximized,
			isMinimized,
			isHidden,
		},
	} = yield select();

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

const didWindowStateLoaded = function* ({ payload: mainWindowState }) {
	yield take(APP_READY);

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

	yield* applyWindowBoundsFromState(mainWindowState);

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

	mainWindow.loadFile(`${ app.getAppPath() }/app/public/app.html`);

	yield put(mainWindowCreated(mainWindow.id));

	yield call(() => new Promise((resolve) => mainWindow.once('ready-to-show', resolve)));

	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}

	yield* showIfNeeded();
};

const doFocusMainWindow = function* () {
	mainWindow.showInactive();

	if (mainWindow.isMinimized()) {
		mainWindow.restore();
	}

	mainWindow.focus();
};

const doShowMainWindow = function* () {
	mainWindow.show();
};

const doHideMainWindow = function* () {
	mainWindow.hide();
};

const doDestroyMainWindow = function* () {
	mainWindow.removeAllListeners();
	mainWindow.close();
};

const selectToUserData = ({ mainWindow = {} }) => ({ mainWindow });

const fetchFromUserData = async (state) => {
	if (Object.keys(state).length === 0) {
		const { x, y, width, height, isMinimized, isMaximized, isHidden } =
			await loadJson('user', 'window-state-main.json');
		state = { x, y, width, height, isMinimized, isMaximized, isHidden };
		await purgeFile('user', 'window-state-main.json');
	}

	(await getStore()).dispatch(mainWindowStateLoaded(state));
};

export const attachMainWindowStateToStore = () => connectUserData(selectToUserData, fetchFromUserData);

export const useMainWindow = async () => {
	(await getSaga()).run(function* watchMainWindowActions() {
		yield takeEvery(MAIN_WINDOW_STATE_LOADED, didWindowStateLoaded);
		yield takeEvery(FOCUS_MAIN_WINDOW, doFocusMainWindow);
		yield takeEvery(SHOW_MAIN_WINDOW, doShowMainWindow);
		yield takeEvery(HIDE_MAIN_WINDOW, doHideMainWindow);
		yield takeEvery(DESTROY_MAIN_WINDOW, doDestroyMainWindow);
	});

	attachMainWindowStateToStore();
};
