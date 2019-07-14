import { remote } from 'electron';
import { useState } from 'react';
import { takeEvery } from 'redux-saga/effects';
import { useSaga } from '../components/App/SagaMiddlewareProvider';
import { WEBVIEW_FOCUSED } from '../../actions';


export const useFocusedWebContents = () => {
	const [focusedWebContents, setFocusedWebContents] = useState(remote.getCurrentWebContents());

	useSaga(function* () {
		function* handleWebviewFocused({ payload: { webContentsId } }) {
			setFocusedWebContents(
				webContentsId
					? remote.webContents.fromId(webContentsId)
					: remote.getCurrentWebContents()
			);
		}

		yield takeEvery(WEBVIEW_FOCUSED, handleWebviewFocused);
	});

	return focusedWebContents;
};
