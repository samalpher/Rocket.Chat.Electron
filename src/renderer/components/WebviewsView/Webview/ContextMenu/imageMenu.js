import { t } from 'i18next';
import { useCallback } from 'react';
import { useFocusedWebContents } from '../../hooks';


export const useImageMenuTemplate = () => {
	const getFocusedWebContents = useFocusedWebContents();

	const onClickSaveImageAs = (url) => {
		getFocusedWebContents().downloadURL(url);
	};

	return useCallback(({
		mediaType,
		srcURL,
	} = {}) => (mediaType === 'image'
		? [
			{
				label: t('contextMenu.saveImageAs'),
				click: onClickSaveImageAs.bind(null, srcURL),
			},
			{ type: 'separator' },
		]
		: []));
};
