import createDebugLogger from 'debug';
import { remote } from 'electron';
import {
	forwardToRenderer,
	forwardToMain,
	getInitialStateRenderer,
	replayActionMain,
	replayActionRenderer,
} from 'electron-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { reducer as windowVisible } from './windowVisible';
import { reducer as loading } from './loading';
import { reducer as preferences } from './preferences';
import { reducer as servers } from './servers';
import { reducer as view } from './view';
import { reducer as editFlags } from './editFlags';
import { reducer as historyFlags } from './historyFlags';
import { reducer as modal } from './modal';
import { reducer as update } from './update';
import { reducer as screensharing } from './screensharing';


const reducer = combineReducers({
	windowVisible,
	loading,
	preferences,
	servers,
	view,
	editFlags,
	historyFlags,
	modal,
	update,
	screensharing,
});

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
