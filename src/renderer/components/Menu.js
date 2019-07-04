import { remote } from 'electron';
import { forwardRef, useImperativeHandle } from 'react';


export const Menu = forwardRef(
	function Menu({ template }, ref) {
		useImperativeHandle(ref, () => remote.Menu.buildFromTemplate(template), [template]);

		return null;
	}
);

Menu.displayName = 'Menu';
