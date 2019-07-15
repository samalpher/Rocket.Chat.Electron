import { app } from 'electron';
import { setupErrorHandling } from '../errorHandling';
import { setupStore } from './store';
import {
	appActivated,
	appSecondInstanceLaunched,
	appWillQuit,
} from '../actions';
import { setupI18n } from './i18n';
import { setupUserDataPath } from './userData/fileSystem';
import { usePreferences } from './userData/preferences';
import { isRequestingUserDataReset, resetUserData, useUserDataReset } from './userData/reset';
import { restoreState } from './userData';
import { setupBasicAuth } from './basicAuth';
import { setupCertificates } from './certificates';
import { setupDownloads } from './downloads';
import { useSpellChecking as setupSpellChecking } from './spellchecking';
import { setupUpdate } from './update';
import { setupMainWindow } from './mainWindow';
import { useServers } from './userData/servers';
import { service as debug } from '../debug';


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
	app.on('newListener', (eventName) => debug('%o event listener attached', eventName));
	app.on('removeListener', (eventName) => debug('%o event listener detached', eventName));

	app.on('window-all-closed', () => {
		app.quit();
	});
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

export const startApp = async () => {
	setupErrorHandling('main');

	setupUserDataPath();

	const [store, sagaMiddleware] = setupStore();
	const globalState = {
		getState: store.getState,
		dispatch: store.dispatch,
		runSaga: sagaMiddleware.run,
	};

	restoreState(globalState);

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

	await attachEvents(globalState);
	await setupBasicAuth(globalState);
	await setupCertificates(globalState);
	await setupUpdate(globalState);

	await app.whenReady();

	await setupI18n(globalState);
	await setupDownloads(globalState);
	await setupMainWindow(globalState);

	await useUserDataReset(globalState);

	await useServers(globalState);
	await setupSpellChecking(globalState);
};
