import createDebugLogger from 'debug';
import { remote } from 'electron';
import {
	forwardToRenderer,
	forwardToMain,
	getInitialStateRenderer,
	replayActionMain,
	replayActionRenderer,
} from 'electron-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { reducer } from './reducers';


export let store;
export let sagaMiddleware;

const isEquals = (a, b) => {
	for (const key in a) {
		if (a[key] !== b[key]) {
			return false;
		}
	}

	for (const key in b) {
		if (!(key in a)) {
			return false;
		}
	}

	return true;
};

export const connect = (mapStateToProps) => (update) => {
	let prevProps = {};

	return store.subscribe(() => {
		const props = mapStateToProps(store.getState());
		if (isEquals(prevProps, props)) {
			return;
		}

		update(props, prevProps);
		prevProps = props;
	});
};

export const setupStore = () => {
	const debug = createDebugLogger('rc:store');
	const isRendererProcess = process.type === 'renderer';
	const isPreloadProcess = isRendererProcess && remote.getCurrentWebContents().getType() === 'webview';

	sagaMiddleware = createSagaMiddleware();

	const middlewares = [
		...(isRendererProcess ? [forwardToMain] : []),
		sagaMiddleware,
		...(!isRendererProcess ? [forwardToRenderer] : []),
	];

	const debugReducer = (reducer) => (state, action) => {
		if (!isPreloadProcess) {
			const { type, payload } = action;
			debug(...[type, payload].filter(Boolean));
		}
		return reducer(state, action);
	};

	store = createStore(
		process.env.NODE_ENV ? debugReducer(reducer) : reducer,
		isRendererProcess ? getInitialStateRenderer() : {},
		applyMiddleware(...middlewares),
	);

	isRendererProcess ? replayActionRenderer(store) : replayActionMain(store);

	if (process.env.NODE_ENV === 'development' && isRendererProcess) {
		window.store = store;
	}
};

setupStore();
