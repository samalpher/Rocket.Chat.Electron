import querystring from 'querystring';
import { put, takeEvery } from 'redux-saga/effects';
import { parse as parseUrl } from 'url';
import { normalizeServerUrl } from '../utils';
import { sagaMiddleware } from '../store';
import {
	COMMAND_LINE_ARGUMENT_PASSED,
	DEEP_LINK_REQUESTED,
	processAuthDeepLink,
	processRoomDeepLink,
} from '../store/actions';


const isRocketChatLink = (link) => parseUrl(link).protocol === 'rocketchat:';

const handleLink = function *(link) {
	const { hostname:	action, query } = parseUrl(link);

	const { host, ...params } = querystring.parse(query);
	const url = normalizeServerUrl(host);

	if (!url) {
		return;
	}

	switch (action) {
		case 'auth':
			yield put(processAuthDeepLink({ url, ...params }));
			break;

		case 'room': {
			yield put(processRoomDeepLink({ url, ...params }));
			break;
		}
	}
};

const deepLinkRequested = function *(event, link) {
	if (!isRocketChatLink(link)) {
		return;
	}

	event.preventDefault();
	yield handleLink(link);
};

const commandLineArgumentPassed = function *({ payload: arg }) {
	if (!isRocketChatLink(arg)) {
		return;
	}

	yield handleLink(arg);
};

sagaMiddleware.run(function *deepLinksSaga() {
	yield takeEvery(DEEP_LINK_REQUESTED, deepLinkRequested);
	yield takeEvery(COMMAND_LINE_ARGUMENT_PASSED, commandLineArgumentPassed);
});
