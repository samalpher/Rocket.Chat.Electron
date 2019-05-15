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
import { reducer } from './reducers';


const debug = createDebugLogger('rc:store');
const isRendererProcess = process.type === 'renderer';
const isPreloadProcess = isRendererProcess && remote.getCurrentWebContents().getType() === 'webview';

const middlewares = [
	...(isRendererProcess ? [forwardToMain] : []),
	...(!isRendererProcess ? [forwardToRenderer] : []),
];

const debugReducer = (reducer) => (state, action) => {
	if (!isPreloadProcess) {
		const { type, payload } = action;
		debug(...[type, payload].filter(Boolean));
	}
	return reducer(state, action);
};

export const store = createStore(
	process.env.NODE_ENV ? debugReducer(reducer) : reducer,
	isRendererProcess ? getInitialStateRenderer() : {},
	applyMiddleware(...middlewares),
);

isRendererProcess ? replayActionRenderer(store) : replayActionMain(store);

if (process.env.NODE_ENV === 'development' && isRendererProcess) {
	window.store = store;
}
