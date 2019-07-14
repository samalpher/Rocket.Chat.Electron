import { takeEvery } from 'redux-saga/effects';
import { useSaga } from '../../App/SagaMiddlewareProvider';
import {
	RELOAD_MAIN_WINDOW,
	TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW,
	DESTROY_MAIN_WINDOW,
	SHOW_MAIN_WINDOW,
	HIDE_MAIN_WINDOW,
	FOCUS_MAIN_WINDOW,
} from '../../../../actions';


export default (mainWindow) => {
	useSaga(function* () {
		yield takeEvery(RELOAD_MAIN_WINDOW, function* () {
			mainWindow.reload();
		});

		yield takeEvery(TOGGLE_DEV_TOOLS_ON_MAIN_WINDOW, function* () {
			mainWindow.toggleDevTools();
		});

		yield takeEvery(FOCUS_MAIN_WINDOW, function* () {
			mainWindow.showInactive();

			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}

			mainWindow.focus();
		});

		yield takeEvery(SHOW_MAIN_WINDOW, function* () {
			mainWindow.show();
		});

		yield takeEvery(HIDE_MAIN_WINDOW, function* () {
			mainWindow.hide();
		});

		yield takeEvery(DESTROY_MAIN_WINDOW, function* () {
			mainWindow.removeAllListeners();
			mainWindow.close();
		});
	}, []);
};
