import { clipboard, shell } from 'electron';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';


export const useLinkMenuTemplate = () => {
	const { t } = useTranslation();

	const onClickOpenLink = (url) => {
		shell.openExternal(url);
	};

	const onClickCopyLinkText = (text) => {
		clipboard.write({ text, bookmark: text });
	};

	const onClickCopyLinkAddress = (text, url) => {
		clipboard.write({ text: url, bookmark: text });
	};

	return useCallback(({
		linkURL,
		linkText,
	}) => (linkURL
		? [
			{
				label: t('contextMenu.openLink'),
				click: onClickOpenLink.bind(null, linkURL),
			},
			{
				label: t('contextMenu.copyLinkText'),
				enabled: !!linkText,
				click: onClickCopyLinkText.bind(null, linkText, linkURL),
			},
			{
				label: t('contextMenu.copyLinkAddress'),
				click: onClickCopyLinkAddress.bind(null, linkText, linkURL),
			},
			{
				type: 'separator',
			},
		]
		: []));
};
