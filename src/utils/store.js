import { call, take } from 'redux-saga/effects';
import { arePlainObjectsEqual, defer } from './index';


export const connect = (store, selector) => (fn) => {
	const deferred = defer();

	const deferredDisconnect = () => {
		deferred.promise.then((disconnect) => disconnect());
	};

	Promise.resolve(store).then((store) => {
		let previousState = {};

		const disconnect = store.subscribe(() => {
			const state = selector(store.getState());
			if (arePlainObjectsEqual(previousState, state)) {
				return;
			}

			fn.call(null, state, previousState);
			previousState = state;
		});

		deferred.resolve(disconnect);
	});

	return deferredDisconnect;
};

export const waitForAction = (saga, actionType) => (fn) => {
	function* waitForAction() {
		const action = yield take(actionType);
		yield call(fn, action);
	}

	Promise.resolve(saga).then((saga) => {
		saga.run(waitForAction);
	});
};
