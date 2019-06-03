import { css } from '@emotion/core';
import styled from '@emotion/styled';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { takeLeading } from 'redux-saga/effects';
import { useSaga } from './hooks';
import {
	RELOAD_WEBVIEW,
	OPEN_DEVTOOLS_FOR_WEBVIEW,
	triggerContextMenu,
	webviewCreated,
	webviewDestroyed,
	setServerProperties,
	historyFlagsUpdated,
} from '../store/actions';


const WebviewComponent = styled('webview')`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	transition: opacity var(--transitions-duration);
	${ ({ active }) => active && css`
		z-index: 1;
		opacity: 1;
	` }
	${ ({ active }) => !active && css`
		z-index: unset;
		opacity: 0;
	` }
`;

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
	onCreate: (url, webContents) => dispatch(webviewCreated(url, webContents.id)),
	onDestroy: (url, webContents) => dispatch(webviewDestroyed(url, webContents.id)),
	onContextMenu: (event) => {
		event.preventDefault();
		dispatch(triggerContextMenu(event.params));
	},
	onDidNavigate: (url, webContents, lastPath) => {
		dispatch(setServerProperties({ url, lastPath }));
		dispatch(historyFlagsUpdated({
			canGoBack: webContents.canGoBack(),
			canGoForward: webContents.canGoForward(),
		}));
	},
});

export const Webview = connect(mapStateToProps, mapDispatchToProps)(
	function Webview({
		active,
		lastPath,
		url,
		onCreate,
		onDestroy,
		onFocus,
		onContextMenu,
		onReady,
		onDidNavigate,
	}) {
		const webviewRef = useRef(null);

		const [loadingError, setLoadingError] = useState(false);

		useEffect(() => {
			onCreate(url, webviewRef.current.getWebContents());
			return () => {
				onDestroy(url, webviewRef.current.getWebContents());
			};
		}, []);

		useEffect(() => {
			const webview = webviewRef.current;
			onFocus && webview.addEventListener('focus', onFocus);
			onContextMenu && webview.addEventListener('context-menu', onContextMenu);
			return () => {
				onFocus && webview.removeEventListener('focus', onFocus);
				onContextMenu && webview.removeEventListener('context-menu', onContextMenu);
			};
		}, []);

		useEffect(() => {
			const webview = webviewRef.current;

			const handleDomReady = () => {
				webview.send('set-server-url', url);
				setLoadingError(false);
				onReady && onReady();
			};

			const handleDidNavigateInPage = ({ url: lastPath }) => {
				if (lastPath.indexOf(url) !== 0) {
					return;
				}

				onDidNavigate && onDidNavigate(url, webview.getWebContents(), lastPath);
			};

			const handleDidFailLoad = ({ isMainFrame }) => {
				if (isMainFrame) {
					setLoadingError(true);
					onReady && onReady();
				}
			};

			const handleDidGetResponseDetails = ({ resourceType, httpResponseCode }) => {
				if (resourceType === 'mainFrame' && httpResponseCode >= 500) {
					setLoadingError(true);
					onReady && onReady();
				}
			};

			const handleConsoleMessage = ({ level, line, message, sourceId }) => {
				const log = {
					[-1]: console.debug,
					0: console.log,
					1: console.warn,
					2: console.error,
				}[level];
				log(`${ url }\n${ message }\n${ sourceId } : ${ line }`);
			};

			webview.addEventListener('dom-ready', handleDomReady);
			webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
			webview.addEventListener('did-fail-load', handleDidFailLoad);
			webview.addEventListener('did-get-response-details', handleDidGetResponseDetails);
			webview.addEventListener('console-message', handleConsoleMessage);
			return () => {
				webview.removeEventListener('dom-ready', handleDomReady);
				webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
				webview.removeEventListener('did-fail-load', handleDidFailLoad);
				webview.removeEventListener('did-get-response-details', handleDidGetResponseDetails);
				webview.removeEventListener('console-message', handleConsoleMessage);
			};
		}, []);

		function *reload({ payload: { ignoringCache = false, fromUrl = false } }) {
			const webview = webviewRef.current;
			if (ignoringCache) {
				webview.reloadIgnoringCache();
				return;
			}

			if (fromUrl) {
				webview.loadURL(url);
				return;
			}

			webview.reload();
		}

		function *openDevToolsFor() {
			const webview = webviewRef.current;
			webview.openDevTools();
		}

		useSaga(function *watchWebviewsActions() {
			yield takeLeading(
				({ type, payload: { url: _url, webContentsId } = {} }) => {
					const webview = webviewRef.current;
					return (
						type === RELOAD_WEBVIEW &&
						(url === _url || webview.getWebContents().id === webContentsId)
					);
				},
				reload
			);

			yield takeLeading(
				({ type, payload }) => type === OPEN_DEVTOOLS_FOR_WEBVIEW && payload === url,
				openDevToolsFor
			);
		});

		return (
			<>
				<WebviewComponent
					ref={webviewRef}
					preload="../preload.js"
					allowpopups="true"
					disablewebsecurity="true"
					src={lastPath || url}
					active={active && !loadingError}
				/>
			</>
		);
	}
);
