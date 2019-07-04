import { useMemo } from 'react';
import { useAppMenuTemplate } from './appMenu';
import { useEditMenuTemplate } from './editMenu';
import { useViewMenuTemplate } from './viewMenu';
import { useWindowMenuTemplate } from './windowMenu';
import { useHelpMenuTemplate } from './helpMenu';


export const useTemplate = () => {
	const appMenuTemplate = useAppMenuTemplate();
	const editMenuTemplate = useEditMenuTemplate();
	const viewMenuTemplate = useViewMenuTemplate();
	const windowMenuTemplate = useWindowMenuTemplate();
	const helpMenuTemplate = useHelpMenuTemplate();

	const templates = [
		appMenuTemplate,
		editMenuTemplate,
		viewMenuTemplate,
		windowMenuTemplate,
		helpMenuTemplate,
	];

	return useMemo(() => [].concat(...templates), templates);
};
