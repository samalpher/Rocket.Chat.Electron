import { useCallback } from 'react';
import { useSpellCheckingMenuTemplate } from './spellCheckingMenu';
import { useImageMenuTemplate } from './imageMenu';
import { useLinkMenuTemplate } from './linkMenu';
import { useEditMenuTemplate } from './editMenu';


export const useContextMenuTemplate = () => {
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
