import { remote } from 'electron';
import { useCallback, useEffect } from 'react';
import { useSpellCheckingMenuTemplate } from './spellCheckingMenu';
import { useImageMenuTemplate } from './imageMenu';
import { useLinkMenuTemplate } from './linkMenu';
import { useEditMenuTemplate } from './editMenu';


const useContextMenuTemplate = () => {
	const spellCheckingMenuTemplate = useSpellCheckingMenuTemplate();
	const imageMenuTemplate = useImageMenuTemplate();
	const linkMenuTemplate = useLinkMenuTemplate();
	const editMenuTemplate = useEditMenuTemplate();

	return useCallback(async (params) => [
		...await spellCheckingMenuTemplate(params),
		...await imageMenuTemplate(params),
		...await linkMenuTemplate(params),
		...await editMenuTemplate(params),
	]);
};

export const useContextMenuTrigger = (ref) => {
	const createTemplate = useContextMenuTemplate();

	const trigger = async (params) => {
		const menu = remote.Menu.buildFromTemplate(await createTemplate(params));
		menu.popup();
	};

	useEffect(() => {
		ref.current = { trigger };

		return () => {
			ref.current = null;
		};
	}, []);
};
