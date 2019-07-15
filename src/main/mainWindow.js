import { app, BrowserWindow } from 'electron';
import {
	mainWindowCreated,
	mainWindowStateLoaded,
} from '../actions';
import { connectUserData } from './userData';
import { loadJson, purgeFile } from './userData/fileSystem';


const selectToUserData = (getState) => () => (({ mainWindow }) => ({ mainWindow }))(getState());

const fetchFromUserData = (dispatch) => async (state) => {
	if (Object.keys(state).length === 0) {
		const { x, y, width, height, isMinimized, isMaximized, isHidden } =
			await loadJson('user', 'window-state-main.json');
		state = { x, y, width, height, isMinimized, isMaximized, isHidden };
		await purgeFile('user', 'window-state-main.json');
	}

	dispatch(mainWindowStateLoaded(state));
};

export const setupMainWindow = ({ getState, dispatch }) => {
	connectUserData(selectToUserData(getState), fetchFromUserData(dispatch));

	const { mainWindow: { width, height } } = getState();

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

	dispatch(mainWindowCreated(mainWindow.id));

	mainWindow.loadFile(`${ app.getAppPath() }/app/public/app.html`);
};
