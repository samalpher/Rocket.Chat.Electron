import { css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { normalizeServerUrl } from '../../utils';
import { View } from '../View';
import { Button } from '../ui/Button';
import { RocketChatLogo } from '../ui/RocketChatLogo';
import { showServer, addServerFromUrl } from '../../store/actions';


const Outer = styled(View)`
	background-color: var(--color-dark);
	align-items: center;
	justify-content: center;
	overflow-y: auto;
	-webkit-app-region: drag;
`;

const Inner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100vw;
	max-width: 30rem;
	padding: 0 1rem;
	-webkit-app-region: no-drag;
`;

const OfflineCard = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 14rem;
	margin: 1rem 0;
	padding: 1rem;
	border-radius: 2px;
	color: var(--color-red);
	background-color: var(--color-white);
	box-shadow:
		0 0 2px 0 rgba(47, 52, 61,.08),
		0 0 12px 0 rgba(47, 52, 61,.12);
`;

const ConnectToServerForm = styled.form`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	width: 100%;
	margin: 1rem 0;
	padding: 1rem;
	border-radius: 2px;
	background-color: var(--color-white);
	box-shadow:
		0 0 2px 0 rgba(47, 52, 61,.08),
		0 0 12px 0 rgba(47, 52, 61,.12);
`;

const ConnectToServerLabel = styled.h2`
	margin: 1rem 0;
	font-size: 1.25rem;
	font-weight: normal;
	text-transform: uppercase;
	color: var(--color-dark-70);
	line-height: 1.5;
`;

const ConnectToServerInput = styled.input`
	width: 100%;
	padding: 0.5rem;
	margin: 1rem 0;
	border-width: 0;
	border-bottom: 1px solid var(--color-dark-20);
	background-color: transparent;
	box-shadow: 0 0 0;
	font-family: var(--font-family);
	font-size: 1.75rem;
	font-weight: normal;
	${ ({ error }) => error && css`
		animation: ${ keyframes`
			0%,
			100% {
				transform: translate3d(0, 0, 0);
			}
			10%,
			30%,
			50%,
			70%,
			90% {
				transform: translate3d(-10px, 0, 0);
			}
			20%,
			40%,
			60%,
			80% {
				transform: translate3d(10px, 0, 0);
			}
		` } 1s;
	` }

	&:-webkit-autofill {
		color: var(--color-white);
		background-color: transparent;
		box-shadow: 0 0 0 1000px var(--color-dark-05) inset;
	}
`;

const ConnectToServerError = styled.div`
	margin: 1rem 0;
	color: var(--color-red);
`;

const defaultServerUrl = 'https://open.rocket.chat';

const validateServer = async (serverUrl, timeout = 5000) => {
	try {
		const headers = new Headers();

		if (serverUrl.includes('@')) {
			const url = new URL(serverUrl);
			serverUrl = url.origin;
			headers.set('Authorization', `Basic ${ btoa(`${ url.username }:${ url.password }`) }`);
		}
		const response = await Promise.race([
			fetch(`${ serverUrl }/api/info`, { headers }),
			new Promise((resolve, reject) => setTimeout(() => reject('timeout'), timeout)),
		]);

		if (response.status === 401) {
			return 'basic-auth';
		}

		if (!response.ok) {
			return 'invalid';
		}

		const { success } = await response.json();
		if (!success) {
			return 'invalid';
		}

		return 'valid';
	} catch (error) {
		return 'invalid';
	}
};

const useRedux = () => {
	const state = useSelector(({
		loading,
		view,
		servers,
	}) => ({
		visible: !loading && view === 'landing',
		servers,
	}));

	const dispatch = useDispatch();

	const handleConnectToServer = async (serverUrl) => {
		const index = state.servers.findIndex(({ url }) => url === serverUrl);

		if (index > -1) {
			dispatch(showServer(serverUrl));
			return;
		}

		const result = await validateServer(serverUrl);
		if (result === 'valid') {
			dispatch(addServerFromUrl(serverUrl));
			dispatch(showServer(serverUrl));
		}

		return result;
	};

	return {
		...state,
		handleConnectToServer,
	};
};

const useConnectionStatus = () => {
	const [offline, setOffline] = useState(false);

	useEffect(() => {
		const handleConnectionStatus = () => {
			setOffline(!navigator.onLine);
		};

		window.addEventListener('online', handleConnectionStatus);
		window.addEventListener('offline', handleConnectionStatus);
		handleConnectionStatus();

		return () => {
			window.removeEventListener('online', handleConnectionStatus);
			window.removeEventListener('offline', handleConnectionStatus);
		};
	}, []);

	return offline;
};

const useForm = () => {
	const [serverUrl, setServerUrl] = useState('');
	const [error, setError] = useState(null);
	const [validating, setValidating] = useState(false);
	const { t } = useTranslation();

	const { handleConnectToServer } = useRedux();

	const handleSubmit = async (event) => {
		event.preventDefault();

		setError(null);
		setValidating(true);

		const value = serverUrl.trim() || defaultServerUrl;

		const tries = [
			value,
			(
				!/(^https?:\/\/)|(\.)|(^([^:]+:[^@]+@)?localhost(:\d+)?$)/.test(value) ?
					`https://${ value }.rocket.chat` :
					null
			),
		].filter(Boolean).map(normalizeServerUrl);

		let result;
		for (const serverUrl of tries) {
			setServerUrl(serverUrl);

			result = await handleConnectToServer(serverUrl);

			if (result === 'valid') {
				setServerUrl('');
				setError(null);
				setValidating(false);
				return;
			}
		}

		switch (result) {
			case 'basic-auth':
				setError(t('error.authNeeded', { auth: 'username:password@host' }));
				setValidating(false);
				break;

			case 'invalid':
				setError(t('error.noValidServerFound'));
				setValidating(false);
				break;

			case 'timeout':
				setError(t('error.connectTimeout'));
				setValidating(false);
				break;
		}
	};

	const handleServerUrlChange = ({ currentTarget: { value } }) => {
		setServerUrl(value);
		setError(null);
	};

	return {
		serverUrl,
		error,
		validating,
		handleSubmit,
		handleServerUrlChange,
	};
};

export function LandingView() {
	const { visible } = useRedux();
	const offline = useConnectionStatus();
	const {
		serverUrl,
		error,
		validating,
		handleSubmit,
		handleServerUrlChange,
	} = useForm();
	const { t } = useTranslation();

	return (
		<Outer visible={visible}>
			<Inner>
				<RocketChatLogo dark />
				{offline ?
					(
						<OfflineCard>
							{t('error.offline')}
						</OfflineCard>
					) :
					(
						<ConnectToServerForm method="/" onSubmit={handleSubmit}>
							<ConnectToServerLabel>
								{t('landing.inputUrl')}
							</ConnectToServerLabel>

							<ConnectToServerInput
								type="text"
								placeholder={defaultServerUrl}
								dir="auto"
								value={serverUrl}
								error={error}
								onChange={handleServerUrlChange}
							/>

							<Button type="submit" primary disabled={validating}>
								{validating ? t('landing.validating') : t('landing.connect')}
							</Button>

							{error && (
								<ConnectToServerError>
									{error}
								</ConnectToServerError>
							)}
						</ConnectToServerForm>
					)}
			</Inner>
		</Outer>
	);
}
