import { remote } from 'electron';
import { useEffect, useMemo, useState } from 'react';
import { getPathFromApp } from '../../utils';


const getTrayIconName = (badge) => {
	if (process.platform === 'darwin') {
		return badge ? 'notification' : 'default';
	}

	if (badge === '•') {
		return 'notification-dot';
	}

	if (Number.isInteger(badge)) {
		return badge > 9 ? 'notification-plus-9' : `notification-${ String(badge) }`;
	}

	return 'default';
};

export const useIcon = (app = true, badge = null) => {
	const { nativeImage, systemPreferences } = remote;

	const [dark, setDark] = useState(systemPreferences.isDarkMode());

	useEffect(() => {
		if (process.platform !== 'darwin') {
			return;
		}

		const subscriberId = systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
			setDark(systemPreferences.isDarkMode());
		});

		return () => {
			systemPreferences.unsubscribeNotification(subscriberId);
		};
	}, []);

	return useMemo(() => {
		if (app) {
			return nativeImage.createFromPath(getPathFromApp('public/images/icon.png'));
		}

		const iconset = process.platform === 'darwin' ? `darwin${ dark ? '-dark' : '' }` : process.platform;
		const name = getTrayIconName(badge);
		const extension = process.platform === 'win32' ? 'ico' : 'png';

		return nativeImage.createFromPath(getPathFromApp(`public/images/tray/${ iconset }/${ name }.${ extension }`));
	}, [app, dark, badge]);
};
