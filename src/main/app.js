import { app } from 'electron';
import { call, put, takeEvery } from 'redux-saga/effects';
import { setupErrorHandling } from '../errorHandling';
import { getStore, getSaga, setupStore } from './store';
import {
	APP_ACTIVATED,
	APP_SECOND_INSTANCE_LAUNCHED,
	APP_WILL_QUIT,
	appActivated,
	appReady,
	appSecondInstanceLaunched,
	appWillQuit,
	destroyMainWindow,
	focusMainWindow,
	showMainWindow,
} from '../actions';
import { useI18n } from './i18n';
import { setupUserDataPath } from './userData/fileSystem';
import { usePreferences } from './userData/preferences';
import { isRequestingUserDataReset, resetUserData, useUserDataReset } from './userData/reset';
import { createElectronStore } from './userData/store';
import { useBasicAuth } from './basicAuth';
import { useCertificates } from './certificates';
import { useDeepLinks, processDeepLink } from './deepLinks';
import { useDownloads } from './downloads';
import { useSpellChecking } from './spellchecking';
import { useUpdate } from './update';
import { useMainWindow } from './mainWindow';
import { useServers } from './userData/servers';
import { useView } from './userData/view';


const didAppActivate = function* () {
	yield put(showMainWindow());
};

const doAppWillQuit = function* () {
	yield put(destroyMainWindow());
};

const didAppSecondInstanceLaunch = function* ({ payload: args }) {
	yield put(focusMainWindow());

	for (const arg of args) {
		yield call(processDeepLink, arg);
	}
};

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
	app.on('second-instance', (event, argv) => {
		Promise.resolve(getStore())
			.then((store) => store.dispatch(appSecondInstanceLaunched(argv.slice(2))));
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
	useDeepLinks();
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

	for (const arg of args) {
		processDeepLink(arg);
	}

	(await getSaga()).run(function* () {
		yield takeEvery(APP_ACTIVATED, didAppActivate);
		yield takeEvery(APP_WILL_QUIT, doAppWillQuit);
		yield takeEvery(APP_SECOND_INSTANCE_LAUNCHED, didAppSecondInstanceLaunch);
	});
};
