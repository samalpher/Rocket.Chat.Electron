import { app } from 'electron';
import { setupErrorHandling } from '../errorHandling';
import { setupStore } from './store';
import {
	appActivated,
	appReady,
	appSecondInstanceLaunched,
	appWillQuit,
} from '../actions';
import { useI18n } from './i18n';
import { setupUserDataPath } from './userData/fileSystem';
import { usePreferences } from './userData/preferences';
import { isRequestingUserDataReset, resetUserData, useUserDataReset } from './userData/reset';
import { createElectronStore } from './userData/store';
import { useBasicAuth } from './basicAuth';
import { useCertificates } from './certificates';
import { useDownloads } from './downloads';
import { useSpellChecking } from './spellchecking';
import { useUpdate } from './update';
import { useMainWindow } from './mainWindow';
import { useServers } from './userData/servers';
import { useView } from './userData/view';


const setupAppParameters = ({ getState }) => {
	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');
	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

	const disableHardwareAcceleration = (({
		preferences: {
			disableHardwareAcceleration = process.platform === 'linux',
		},
	}) => disableHardwareAcceleration)(getState());

	if (disableHardwareAcceleration) {
		app.disableHardwareAcceleration();
	}
};

const canStart = () => process.mas || app.requestSingleInstanceLock();

const attachEvents = ({ dispatch }) => {
	app.on('window-all-closed', () => app.quit());
	app.on('activate', () => {
		dispatch(appActivated());
	});
	app.on('before-quit', () => {
		dispatch(appWillQuit());
	});
	app.on('second-instance', (event, argv) => {
		dispatch(appSecondInstanceLaunched(argv.slice(2)));
	});
};

export const startApp = () => {
	setupErrorHandling('main');

	const [store, sagaMiddleware] = setupStore();
	const globalState = {
		getState: store.getState,
		dispatch: store.dispatch,
		runSaga: sagaMiddleware.run,
	};

	setupUserDataPath();

	createElectronStore(globalState);

	usePreferences(globalState);

	setupAppParameters(globalState);

	const args = process.argv.slice(2);

	if (isRequestingUserDataReset(args)) {
		resetUserData();
		return;
	}

	if (!canStart()) {
		app.exit(0);
		return;
	}

	attachEvents(globalState);

	useBasicAuth(globalState);
	useCertificates(globalState);
	useDownloads(globalState);
	useI18n(globalState);
	useServers(globalState);
	useSpellChecking(globalState);
	useMainWindow(globalState);
	useUpdate(globalState);
	useUserDataReset(globalState);
	useView(globalState);

	app.whenReady().then(() => store.dispatch(appReady()));
};
