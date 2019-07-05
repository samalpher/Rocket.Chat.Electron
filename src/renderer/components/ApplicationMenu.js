import { remote } from 'electron';
import { useEffect } from 'react';
import { useMenu } from '../hooks/menu';


export function ApplicationMenu({ template }) {
	const menu = useMenu(template);

	useEffect(() => {
		remote.Menu.setApplicationMenu(menu);

		return () => {
			remote.Menu.setApplicationMenu(null);
		};
	}, [menu]);

	return null;
}
