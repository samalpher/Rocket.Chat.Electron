import { takeEvery } from 'redux-saga/effects';
import { useSaga } from '../../App/SagaMiddlewareProvider';
import {
	APP_SECOND_INSTANCE_LAUNCHED,
	PROCESS_AUTH_DEEP_LINK,
	APP_ACTIVATED,
	APP_WILL_QUIT,
} from '../../../../actions';


const focus = (mainWindow) => {
	mainWindow.showInactive();

	if (mainWindow.isMinimized()) {
		mainWindow.restore();
	}

	mainWindow.focus();
};

const destroy = (mainWindow) => {
	mainWindow.removeAllListeners();
	mainWindow.close();
};

const useSideEffects = (mainWindow) => {
	useSaga(function *() {
		yield takeEvery(APP_SECOND_INSTANCE_LAUNCHED, function* () {
			focus(mainWindow);
		});

		yield takeEvery(APP_ACTIVATED, function* () {
			mainWindow.show();
		});

		yield takeEvery(APP_WILL_QUIT, function* () {
			destroy(mainWindow);
		});

		yield takeEvery(PROCESS_AUTH_DEEP_LINK, function* () {
			focus(mainWindow);
		});
	}, []);
};

export default useSideEffects;
