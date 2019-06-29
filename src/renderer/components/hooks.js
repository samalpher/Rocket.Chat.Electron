import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { runSaga } from 'redux-saga';


export const useSaga = (saga, deps) => {
	const store = useStore();

	useEffect(() => {
		const task = runSaga(store, saga);

		return () => {
			task.cancel();
		};
	}, deps);
};
