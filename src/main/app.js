import { app } from 'electron';
import jetpack from 'fs-jetpack';
import { takeEvery } from 'redux-saga/effects';
import i18n from '../i18n';
import { sagaMiddleware, store } from '../store';
import {
	APP_LAUNCHED,
	RESET_APP_DATA,
	loadConfig,
	focusWindow,
	showWindow,
	destroyWindow,
	certificateErrorThrown,
	basicAuthLoginRequested,
	deepLinkRequested,
	commandLineArgumentPassed,
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

const setupAppParameters = () => {
	app.setAsDefaultProtocolClient('rocketchat');
	app.setAppUserModelId('chat.rocket');
	app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');
	// TODO: make it a setting
	if (process.platform === 'linux') {
		app.disableHardwareAcceleration();
	}
};

const setupUserDataPath = () => {
	const appName = app.getName();
	const dirName = process.env.NODE_ENV === 'production' ? appName : `${ appName } (${ process.env.NODE_ENV })`;

	app.setPath('userData', jetpack.path(app.getPath('appData'), dirName));
};

const doResetAppData = () => {
	jetpack.remove(app.getPath('userData'));
	app.relaunch({ args: [process.argv[1]] });
	app.quit();
};

const attachAppEvents = () => {
	app.on('window-all-closed', () => {
		app.quit();
	});

	app.on('activate', () => {
		store.dispatch(showWindow());
	});

	app.on('before-quit', () => {
		store.dispatch(destroyWindow());
	});

	app.on('open-url', (event, url) => {
		store.dispatch(deepLinkRequested(event, url));
	});

	app.on('second-instance', (event, argv) => {
		store.dispatch(focusWindow());
		argv.slice(2).forEach((arg) => store.dispatch(commandLineArgumentPassed(arg)));
	});

	app.on('login', (...args) => {
		store.dispatch(basicAuthLoginRequested(...args));
	});

	app.on('certificate-error', (...args) => {
		store.dispatch(certificateErrorThrown(...args));
	});
};

const appLaunched = function *({ payload: args }) {
	setupErrorHandling();
	setupAppParameters();
	setupUserDataPath();

	if (args.includes('--reset-app-data')) {
		doResetAppData();
		return;
	}

	const canStart = process.mas || app.requestSingleInstanceLock();
	if (!canStart) {
		app.quit();
		return;
	}

	attachAppEvents();

	yield app.whenReady();

	yield i18n.initialize();

	store.dispatch(loadConfig());
	args.forEach((arg) => store.dispatch(commandLineArgumentPassed(arg)));
};

const resetAppData = function *() {
	app.relaunch({ args: [process.argv[1], '--reset-app-data'] });
	app.quit();
};

sagaMiddleware.run(function *appSaga() {
	yield takeEvery(APP_LAUNCHED, appLaunched);
	yield takeEvery(RESET_APP_DATA, resetAppData);
});
