import { app } from 'electron';
import jetpack from 'fs-jetpack';
import { call, put, take, takeEvery } from 'redux-saga/effects';
import i18n from '../i18n';
import { sagaMiddleware, store } from '../store';
import {
	APP_ACTIVATED,
	APP_LAUNCHED,
	APP_SECOND_INSTANCE_LAUNCHED,
	APP_WILL_QUIT,
	PREFERENCES_LOADED,
	RESET_APP_DATA,
	appActivated,
	appReady,
	appSecondInstanceLaunched,
	appWillQuit,
	basicAuthLoginRequested,
	certificateErrorThrown,
	commandLineArgumentPassed,
	deepLinkRequested,
	destroyMainWindow,
	focusMainWindow,
	initializeConfig,
	showMainWindow,
} from '../store/actions';


const setupErrorHandling = () => {
	process.on('uncaughtException', (error) => {
		console.error(error && (error.stack || error));
		app.quit(1);
	});

	process.on('unhandledRejection', (reason) => {
		console.error(reason && (reason.stack || reason));
		app.quit(1);
	});
};

const setupUserDataPath = () => {
	const appName = app.getName();
	const dirName = process.env.NODE_ENV === 'production' ? appName : `${ appName } (${ process.env.NODE_ENV })`;

	app.setPath('userData', jetpack.path(app.getPath('appData'), dirName));
};

const setupAppParameters = () => {
	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');
	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');
	// TODO: make it a setting
	if (process.platform === 'linux') {
		app.disableHardwareAcceleration();
	}
};

const resetAppData = () => {
	jetpack.remove(app.getPath('userData'));
	app.relaunch({ args: [process.argv[1]] });
	app.quit();
};

const attachAppEvents = () => {
	app.on('window-all-closed', () => app.quit());
	app.on('activate', () => store.dispatch(appActivated()));
	app.on('before-quit', () => store.dispatch(appWillQuit()));
	app.on('open-url', (event, url) => store.dispatch(deepLinkRequested(event, url)));
	app.on('second-instance', (event, argv) => store.dispatch(appSecondInstanceLaunched(argv.slice(2))));
	app.on('login', (...args) => store.dispatch(basicAuthLoginRequested(...args)));
	app.on('certificate-error', (...args) => store.dispatch(certificateErrorThrown(...args)));
};

const didAppLaunch = function *({ payload: args }) {
	setupErrorHandling();
	setupUserDataPath();
	yield put(initializeConfig());
	yield take(PREFERENCES_LOADED);
	setupAppParameters();

	if (args.includes('--reset-app-data')) {
		resetAppData();
		return;
	}

	const canStart = process.mas || app.requestSingleInstanceLock();
	if (!canStart) {
		app.quit();
		return;
	}

	attachAppEvents();

	yield call(app.whenReady.bind(app));
	yield call(i18n.initialize);

	yield put(appReady());

	for (const arg of args) {
		yield put(commandLineArgumentPassed(arg));
	}
};

const didAppActivate = function *() {
	yield put(showMainWindow());
};

const doAppWillQuit = function *() {
	yield put(destroyMainWindow());
};

const didAppSecondInstanceLaunch = function *({ payload: args }) {
	yield put(focusMainWindow());

	for (const arg of args) {
		yield put(commandLineArgumentPassed(arg));
	}
};

const doResetAppData = function *() {
	app.relaunch({ args: [process.argv[1], '--reset-app-data'] });
	app.quit();
};

sagaMiddleware.run(function *watchAppActions() {
	yield takeEvery(APP_LAUNCHED, didAppLaunch);
	yield takeEvery(APP_ACTIVATED, didAppActivate);
	yield takeEvery(APP_WILL_QUIT, doAppWillQuit);
	yield takeEvery(APP_SECOND_INSTANCE_LAUNCHED, didAppSecondInstanceLaunch);
	yield takeEvery(RESET_APP_DATA, doResetAppData);
});
