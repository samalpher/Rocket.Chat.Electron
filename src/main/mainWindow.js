import { app, BrowserWindow } from 'electron';
import { put, select, take } from 'redux-saga/effects';
import { getStore, getSaga } from './store';
import {
	APP_READY,
	mainWindowCreated,
	mainWindowStateLoaded,
} from '../actions';
import { connectUserData } from './userData/store';
import { loadJson, purgeFile } from './userData/fileSystem';


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
		yield take(APP_READY);

		const [width, height] = yield select(({ mainWindow: { width, height } }) => [width, height]);

		const mainWindow = new BrowserWindow({
			width,
			height,
			minWidth: 600,
			minHeight: 400,
			titleBarStyle: 'hidden',
			show: false,
			webPreferences: {
				nodeIntegration: true,
				webviewTag: true,
			},
		});

		yield put(mainWindowCreated(mainWindow.id));

		mainWindow.loadFile(`${ app.getAppPath() }/app/public/app.html`);
	});

	attachMainWindowStateToStore();
};
