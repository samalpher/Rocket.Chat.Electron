import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { normalizeServerUrl } from '../../../utils';
import { showServer, addServerFromUrl } from '../../../actions';


export const useView = () => {
	const visible = useSelector(({
		loading,
		preferences: { view },
	}) => !loading && view === 'landing');

	return visible;
};

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

export const useConnectionStatus = () => {
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

export const useForm = () => {
	const [serverUrl, setServerUrl] = useState('');
	const [error, setError] = useState(null);
	const [validating, setValidating] = useState(false);
	const { t } = useTranslation();

	const state = useSelector(({
		loading,
		servers,
		preferences: { view },
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
