import { useEffect } from 'react';
import { cancel } from 'redux-saga/effects';
import { sagaMiddleware } from '../store';


export const useSaga = (saga, deps) => useEffect(() => {
	const sagaTask = sagaMiddleware.run(saga);

	return () => {
		sagaMiddleware.run(function *() {
			yield cancel(sagaTask);
		});
	};
}, deps);
