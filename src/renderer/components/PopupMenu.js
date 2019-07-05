import { useEffect } from 'react';
import { useMenu } from '../hooks/menu';


export function PopupMenu({ template = [], open, onClosing }) {
	const menu = useMenu(template);

	useEffect(() => {
		open
			? menu.popup()
			: menu.closePopup();
	}, [menu, open]);

	useEffect(() => {
		if (!onClosing) {
			return;
		}

		menu.addListener('menu-will-close', onClosing);

		return () => {
			menu.removeListener('menu-will-close', onClosing);
		};
	}, [menu, onClosing]);

	return null;
}
