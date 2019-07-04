import React, { createContext, useContext, useEffect } from 'react';
import { getSaga } from '../../store';


const SagaMiddlewareContext = createContext();

export const SagaMiddlewareProvider = React.lazy(async () => {
	const sagaMiddleware = await getSaga();

	const SagaMiddlewareProvider = (props) =>
		<SagaMiddlewareContext.Provider value={sagaMiddleware} {...props} />;

	return { default: SagaMiddlewareProvider };
});

export const useSagaMiddleware = () => useContext(SagaMiddlewareContext);

export const useSaga = (saga, deps = []) => {
	const sagaMiddleware = useSagaMiddleware();

	useEffect(() => {
		const task = sagaMiddleware.run(saga);

		return () => {
			task.cancel();
		};
	}, deps);
};
