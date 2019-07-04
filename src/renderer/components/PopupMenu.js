import React, { useEffect, useRef } from 'react';
import { Menu } from './Menu';


export function PopupMenu({ template = [], open, onClosing }) {
	const menuRef = useRef();

	useEffect(() => {
		open
			? menuRef.current.popup()
			: menuRef.current.closePopup();
	}, [open]);

	useEffect(() => {
		if (!onClosing) {
			return;
		}

		menuRef.current.addListener('menu-will-close', onClosing);

		return () => {
			menuRef.current.removeListener('menu-will-close', onClosing);
		};
	}, [onClosing]);

	return <Menu ref={menuRef} template={template} />;
}
