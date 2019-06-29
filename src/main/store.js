import { forwardToRenderer, replayActionMain } from 'electron-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { store as debug } from '../debug';
import { rootReducer } from '../store/reducers';
import { defer } from '../utils';


const { promise, resolve } = defer();

const withDebug = (reducer) => {
	if (process.env.NODE_ENV === 'production') {
		return reducer;
	}

	return (state, action) => {
		const { type, payload } = action;
		debug(...[type, payload].filter(Boolean));
		return reducer(state, action);
	};
};

export const setupStore = () => {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(withDebug(rootReducer), {}, applyMiddleware(sagaMiddleware, forwardToRenderer));

	replayActionMain(store);

	resolve({ store, sagaMiddleware });
};

export const getStore = () => promise.then(({ store }) => store);

export const getSaga = () => promise.then(({ sagaMiddleware }) => sagaMiddleware);
