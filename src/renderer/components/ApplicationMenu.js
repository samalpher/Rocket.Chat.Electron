import { remote } from 'electron';
import React, { useEffect, useRef } from 'react';
import { Menu } from './Menu';


export function ApplicationMenu({ template }) {
	const menuRef = useRef();

	useEffect(() => {
		remote.Menu.setApplicationMenu(menuRef.current);
	}, [template]);

	useEffect(() => () => {
		remote.Menu.setApplicationMenu(null);
	}, []);

	return <Menu ref={menuRef} template={template} />;
}
