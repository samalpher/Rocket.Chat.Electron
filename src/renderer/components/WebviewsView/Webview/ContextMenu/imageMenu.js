import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusedWebContents } from '../../../../hooks/focusedWebContents';


export const useImageMenuTemplate = () => {
	const focusedWebContents = useFocusedWebContents();

	const { t } = useTranslation();

	const onClickSaveImageAs = (url) => {
		focusedWebContents.downloadURL(url);
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
		: []), [focusedWebContents]);
};
