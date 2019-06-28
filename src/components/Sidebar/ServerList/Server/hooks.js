import { remote } from 'electron';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { parse } from 'url';
import {
	openDevToolsForWebview,
	reloadWebview,
	removeServerFromUrl,
	showServer,
} from '../../../../store/actions';
const { getCurrentWindow, Menu } = remote;


export const useHasUnreadMessages = (badge) => useMemo(() => !!badge, [badge]);

export const useMentionCount = (badge) => useMemo(() => (
	[badge].filter((badge) => parseInt(badge, 10)).filter(Number.isInteger)[0]
), [badge]);

export const useInitials = (url, title) => useMemo(() => (
	title
		.replace(url, parse(url).hostname)
		.split(/[^A-Za-z0-9]+/g)
		.slice(0, 2)
		.map((text) => text.slice(0, 1).toUpperCase())
		.join('')
), [url, title]);

export const useFavicon = (serverUrl) => {
	const url = useMemo(() => {
		const faviconCacheBustingTime = 15 * 60 * 1000;
		const bustingParam = Math.round(Date.now() / faviconCacheBustingTime);
		return `${ serverUrl.replace(/\/$/, '') }/assets/favicon.svg?_=${ bustingParam }`;
	}, [serverUrl]);

	const [loaded, setLoaded] = useState(false);

	const handleLoad = () => {
		setLoaded(true);
	};

	const handleError = () => {
		setLoaded(false);
	};

	return [url, loaded, handleLoad, handleError];
};

export const useSelection = (url) => {
	const dispatch = useDispatch();

	const handleSelect = useCallback(() => {
		dispatch(showServer(url));
	}, [url]);

	return handleSelect;
};

export const useContextMenu = (url) => {
	const dispatch = useDispatch();

	const { t } = useTranslation();

	const handleContextMenu = useCallback((event) => {
		event.preventDefault();

		const menu = Menu.buildFromTemplate([
			{
				label: t('sidebar.item.reload'),
				click: () => dispatch(reloadWebview({ url })),
			},
			{
				label: t('sidebar.item.remove'),
				click: () => dispatch(removeServerFromUrl(url)),
			},
			{
				label: t('sidebar.item.openDevTools'),
				click: () => dispatch(openDevToolsForWebview({ url })),
			},
		]);
		menu.popup(getCurrentWindow());
	}, [url]);

	return handleContextMenu;
};
