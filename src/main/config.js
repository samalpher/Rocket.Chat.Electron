import debug from 'debug';
import ElectronStore from 'electron-store';
import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { sagaMiddleware } from '../store';
import { loadJson, normalizeServerUrl } from '../utils';
import {
	INITIALIZE_CONFIG,
	loadConfig,
	preferencesLoaded,
	viewLoaded,
	serversLoaded,
	setPreferences,
	showLanding,
	showServer,
} from '../store/actions';


const loadPreferences = function *(preferences) {
	yield put(preferencesLoaded(preferences));
};

const loadView = function *(view) {
	yield put(viewLoaded(view));
};

const loadServers = function *(servers) {
	if (servers.length !== 0) {
		yield put(serversLoaded(servers));
		return;
	}

	debug('rc:data')('servers.json');
	const appEntries = yield call(loadJson, 'servers.json', 'app');
	const userEntries = yield call(loadJson, 'servers.json', 'user');
	servers = [
		...(
			Object.entries(appEntries)
				.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
		),
		...(
			Object.entries(userEntries)
				.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
		),
	];

	yield put(serversLoaded(servers));

	yield put(servers[0] ? showServer(servers[0].url) : showLanding());

	if (servers.length <= 1) {
		yield put(setPreferences({ hasSidebar: false }));
	}
};

let config;

const doInitializeConfig = function *() {
	config = new ElectronStore();
	yield* loadPreferences(config.get('preferences', {}));
	yield* loadView(config.get('view', 'landing'));
	yield* loadServers(config.get('servers', []));

	yield put(loadConfig({
		mainWindow: config.get('mainWindow', {}),
		certificates: config.get('certificates', {}),
		update: config.get('update', {}),
	}));
};

const doPersistConfig = function *() {
	yield delay(500);

	const {
		preferences,
		servers,
		view,
		mainWindow,
		certificates,
		update: {
			configuration,
		},
	} = yield select();

	config.set(({
		preferences,
		servers,
		view,
		mainWindow,
		certificates,
		update: configuration,
	}));

	debug('rc:data')('persisted');
};

sagaMiddleware.run(function *watchConfigActions() {
	yield takeEvery(INITIALIZE_CONFIG, doInitializeConfig);
	yield takeLatest('*', doPersistConfig);
});
