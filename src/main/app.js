import { app } from 'electron';
import { setupErrorHandling } from '../errorHandling';
import { getStore, setupStore } from './store';
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


const setupAppParameters = async () => {
	// TODO: wait for preferences
	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');
	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

	// TODO: use preference
	if (process.platform === 'linux') {
		app.disableHardwareAcceleration();
	}
};

const canStart = () => process.mas || app.requestSingleInstanceLock();

const attachEvents = () => {
	app.on('window-all-closed', () => app.quit());
	app.on('activate', () => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(appActivated()));
	});
	app.on('before-quit', () => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(appWillQuit()));
	});
	app.on('second-instance', async (event, argv) => {
		(await getStore()).dispatch(appSecondInstanceLaunched(argv.slice(2)));
	});
};

export const startApp = async () => {
	setupErrorHandling('main');

	setupStore();

	setupUserDataPath();

	createElectronStore();

	usePreferences();

	setupAppParameters();

	const args = process.argv.slice(2);

	if (isRequestingUserDataReset(args)) {
		resetUserData();
		return;
	}

	if (!canStart()) {
		app.exit(0);
		return;
	}

	attachEvents();

	useBasicAuth();
	useCertificates();
	useDownloads();
	useI18n();
	useServers();
	useSpellChecking();
	useMainWindow();
	useUpdate();
	useUserDataReset();
	useView();

	await app.whenReady();

	(await getStore()).dispatch(appReady());
};
