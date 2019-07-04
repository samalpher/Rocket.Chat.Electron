import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusedWebContents } from '../../hooks';


export const useImageMenuTemplate = () => {
	const getFocusedWebContents = useFocusedWebContents();

	const { t } = useTranslation();

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
