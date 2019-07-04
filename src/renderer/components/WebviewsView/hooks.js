import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';
import {
	loadingDone,
	webviewCreated,
	webviewDestroyed,
	setServerProperties,
	historyFlagsUpdated,
	webviewFocused,
	WEBVIEW_FOCUSED,
} from '../../../actions';
import { useSaga } from '../App/SagaMiddlewareProvider';
import { remote } from 'electron';


const useWebviewEvents = () => {
	const dispatch = useDispatch();

	const handleCreate = (url, webContents) => {
		dispatch(webviewCreated(url, webContents.id));
	};

	const handleDestroy = (url, webContents) => {
		dispatch(webviewDestroyed(url, webContents.id));
	};

	const handleFocus = (url, webContents) => {
		dispatch(webviewFocused(url, webContents.id));
	};

	const handleBlur = () => {
		dispatch(webviewFocused(null, null));
	};

	const handleDidNavigate = (url, webContents, lastPath) => {
		dispatch(setServerProperties({ url, lastPath }));
		dispatch(historyFlagsUpdated({
			canGoBack: webContents.canGoBack(),
			canGoForward: webContents.canGoForward(),
		}));
	};

	return {
		onCreate: handleCreate,
		onDestroy: handleDestroy,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onDidNavigate: handleDidNavigate,
	};
};

const useWebviewsState = () => {
	const [webviews, setWebviews] = useState([]);

	const [readyState, setReadyState] = useState({});

	const {
		view,
		servers,
	} = useSelector(({ view, servers }) => ({ view, servers }));

	useEffect(() => {
		const propUrls = servers.map(({ url }) => url);
		const urls = webviews.map(({ url }) => url);
		const newWebviews = [
			...webviews.filter(({ url }) => propUrls.includes(url)),
			...servers.filter(({ url }) => !urls.includes(url)),
		];

		const newReadyState = newWebviews.reduce((state, webview) => ({
			...state,
			ready: webview.ready || false,
		}), {});

		setWebviews(newWebviews);
		setReadyState(newReadyState);
	}, [servers.map(({ url }) => url).join('')]);

	const dispatch = useDispatch();

	useEffect(() => {
		if (Object.values(readyState).every((ready) => ready)) {
			dispatch(loadingDone());
		}
	}, [readyState]);

	const handleReady = (url) => {
		setReadyState({ ...readyState, [url]: true });
	};

	return webviews.map(({ url, lastPath }) => ({
		visible: url === view.url,
		url,
		lastPath,
		onReady: handleReady,
	}));
};

export const useWebviews = () => {
	const states = useWebviewsState();
	const events = useWebviewEvents();

	return states.map((state) => ({
		...state,
		...events,
	}));
};

export const useFocusedWebContents = () => {
	const focusedWebContentsRef = useRef();

	useSaga(function* webviewFocusSaga() {
		yield takeEvery(WEBVIEW_FOCUSED, function* ({ payload: { webContentsId } }) {
			focusedWebContentsRef.current = webContentsId
				? remote.webContents.fromId(webContentsId)
				: remote.getCurrentWebContents();
		});
	});

	return () => focusedWebContentsRef.current;
};
