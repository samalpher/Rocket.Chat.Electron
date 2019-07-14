import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useGlobalBadge from '../../../hooks/useGlobalBadge';
import { useIcon } from '../../../hooks/icon';

export default (mainWindow) => {
	const [hasTray, showWindowOnUnreadChanged] = useSelector(({
		preferences: {
			hasTray,
			showWindowOnUnreadChanged,
		},
	}) => [hasTray, showWindowOnUnreadChanged]);

	const globalBadge = useGlobalBadge();
	const count = Number.isInteger(globalBadge) ? globalBadge : 0;

	const icon = useIcon(hasTray, globalBadge);

	const handleIconChange = () => {
		if (process.platform === 'darwin') {
			return;
		}

		mainWindow.setIcon(icon);
	};

	useEffect(handleIconChange, [icon]);

	const handleFlashFrame = () => {
		if (mainWindow.isFocused()) {
			return;
		}

		const handleFocus = () => mainWindow.flashFrame(false);

		mainWindow.flashFrame(count > 0);
		mainWindow.once('focus', handleFocus);

		() => {
			mainWindow.off('focus', handleFocus);
		};
	};

	useEffect(handleFlashFrame, [globalBadge]);

	const handleUnreadCountChange = () => {
		if (!showWindowOnUnreadChanged) {
			return;
		}

		if (count > 0) {
			mainWindow.showInactive();
		}
	};

	useEffect(handleUnreadCountChange, [showWindowOnUnreadChanged, count]);
};
