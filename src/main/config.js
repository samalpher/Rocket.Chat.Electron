import debug from 'debug';
import ElectronStore from 'electron-store';
import { put, select, takeEvery } from 'redux-saga/effects';
import { sagaMiddleware } from '../store';
import { debounce, loadJson, normalizeServerUrl } from '../utils';
import {
	LOAD_CONFIG,
	CONFIG_LOADING,
	configLoading,
	preferencesLoaded,
	viewLoaded,
	serversLoaded,
	setPreferences,
	showLanding,
	showServer,
} from '../store/actions';


const loadPreferences = function *({ payload: { preferences } }) {
	yield put(preferencesLoaded(preferences));
};

const loadView = function *({ payload: { view } }) {
	yield put(viewLoaded(view));
};

const loadServers = function *({ payload: { servers } }) {
	if (servers.length !== 0) {
		yield put(serversLoaded(servers));
		return;
	}

	debug('rc:data')('servers.json');
	const appEntries = yield loadJson('servers.json', 'app');
	const userEntries = yield loadJson('servers.json', 'user');
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

const loadConfig = function *() {
	config = new ElectronStore();
	yield put(configLoading({
		preferences: config.get('preferences', {}),
		servers: config.get('servers', []),
		view: config.get('view', 'landing'),
		windowState: config.get('windowState', {}),
		certificates: config.get('certificates', {}),
		update: config.get('update', {}),
	}));
};

const persist = debounce((data) => {
	debug('rc:data')('persist');
	config.set(data);
}, 500);

const saveConfig = function *() {
	const {
		preferences,
		servers,
		view,
		windowState,
		certificates,
		update: {
			configuration,
		},
	} = yield select();

	persist({
		preferences,
		servers,
		view,
		windowState,
		certificates,
		update: configuration,
	});
};

sagaMiddleware.run(function *configSaga() {
	yield takeEvery(LOAD_CONFIG, loadConfig);
	yield takeEvery(CONFIG_LOADING, loadPreferences);
	yield takeEvery(CONFIG_LOADING, loadView);
	yield takeEvery(CONFIG_LOADING, loadServers);

	yield takeEvery('*', saveConfig);
});
