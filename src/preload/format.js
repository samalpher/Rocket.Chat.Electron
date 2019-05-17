import { remote } from 'electron';
import { select, takeEvery } from 'redux-saga/effects';
import { sagaMiddleware } from '../store';
import { FORMAT_BUTTON_TOUCHED } from '../store/actions';
const { getCurrentWebContents } = remote;


const formatButtonTouched = function *({ payload: buttonId }) {
	const { view, webviews } = yield select();
	const { id } = getCurrentWebContents();
	const webview = webviews.find(({ webContentsId }) => webContentsId === id);
	if (view.url !== webview.url) {
		return;
	}

	let button = document.querySelector(`.js-format[data-id="${ buttonId }"]`);
	if (!button) {
		const legacyButtonIconClass = {
			bold: 'bold',
			italic: 'italic',
			strike: 'strike',
			inline_code: 'code',
			multi_line: 'multi-line',
		}[buttonId];
		const svg = document.querySelector(`.js-md svg[class$="${ legacyButtonIconClass }"]`);
		button = svg && svg.parentNode;
	}
	button && button.click();
};

sagaMiddleware.run(function *formatSaga() {
	yield takeEvery(FORMAT_BUTTON_TOUCHED, formatButtonTouched);
});

export default () => {};
