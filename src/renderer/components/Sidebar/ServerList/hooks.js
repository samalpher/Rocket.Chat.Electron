import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	sortServers,
} from '../../../../store/actions';


export const useShortcuts = () => {
	const [shortcutsVisible, setShortcutsVisible] = useState(false);

	useEffect(() => {
		const shortcutKey = process.platform === 'darwin' ? 'Meta' : 'Control';

		const onShortcutKeyDown = ({ key }) => {
			key === shortcutKey && setShortcutsVisible(true);
		};

		const onShortcutKeyUp = ({ key }) => {
			key === shortcutKey && setShortcutsVisible(false);
		};

		window.addEventListener('keydown', onShortcutKeyDown);
		window.addEventListener('keyup', onShortcutKeyUp);
		return () => {
			window.removeEventListener('keydown', onShortcutKeyDown);
			window.removeEventListener('keyup', onShortcutKeyUp);
		};
	}, []);

	return shortcutsVisible;
};

export const useServers = () => {
	const {
		servers: propServers,
		view,
	} = useSelector(({ servers, view }) => ({ servers, view }));

	const active = view && view.url;

	const dispatch = useDispatch();

	const handleSort = (urls) => {
		dispatch(sortServers(urls));
	};

	const [dragged, setDragged] = useState(null);
	const [servers, setServers] = useState(propServers);

	useEffect(() => {
		setServers(propServers);
	}, [propServers.map(({ url }) => url).join('')]);

	const handleDragStart = (url, event) => {
		setDragged(url);

		event.dataTransfer.dropEffect = 'move';
		event.dataTransfer.effectAllowed = 'move';
	};

	const handleDragEnd = () => {
		setDragged(null);
	};

	const handleDragEnter = (targetUrl) => {
		const draggedServerIndex = servers.findIndex(({ url }) => url === dragged);
		const targetServerIndex = servers.findIndex(({ url }) => url === targetUrl);

		setServers(servers.map((server, i) => (
			(i === draggedServerIndex && servers[targetServerIndex]) ||
			(i === targetServerIndex && servers[draggedServerIndex]) ||
			server
		)));
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleDrop = (event) => {
		event.preventDefault();
		handleSort(servers.map(({ url }) => url));
	};

	return {
		servers,
		active,
		dragged,
		handleDragStart,
		handleDragEnd,
		handleDragEnter,
		handleDragOver,
		handleDrop,
	};
};
