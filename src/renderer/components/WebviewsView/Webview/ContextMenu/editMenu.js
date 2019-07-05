import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusedWebContents } from '../../../../hooks/focusedWebContents';
import { useTextEditActions } from '../../../../hooks/textEditActions';


export const useEditMenuTemplate = () => {
	const focusedWebContents = useFocusedWebContents();

	const { t } = useTranslation();

	const {
		undo: onClickUndo,
		redo: onClickRedo,
		cut: onClickCut,
		copy: onClickCopy,
		paste: onClickPaste,
		selectAll: onClickSelectAll,
	} = useTextEditActions();

	return useCallback(({
		editFlags: {
			canUndo = false,
			canRedo = false,
			canCut = false,
			canCopy = false,
			canPaste = false,
			canSelectAll = false,
		} = {},
	} = {}) => [
		{
			label: t('contextMenu.undo'),
			accelerator: 'CommandOrControl+Z',
			enabled: canUndo,
			click: onClickUndo,
		},
		{
			label: t('contextMenu.redo'),
			accelerator: process.platform === 'win32' ? 'Control+Y' : 'CommandOrControl+Shift+Z',
			enabled: canRedo,
			click: onClickRedo,
		},
		{ type: 'separator' },
		{
			label: t('contextMenu.cut'),
			accelerator: 'CommandOrControl+X',
			enabled: canCut,
			click: onClickCut,
		},
		{
			label: t('contextMenu.copy'),
			accelerator: 'CommandOrControl+C',
			enabled: canCopy,
			click: onClickCopy,
		},
		{
			label: t('contextMenu.paste'),
			accelerator: 'CommandOrControl+V',
			enabled: canPaste,
			click: onClickPaste,
		},
		{
			label: t('contextMenu.selectAll'),
			accelerator: 'CommandOrControl+A',
			enabled: canSelectAll,
			click: onClickSelectAll,
		},
	], [focusedWebContents]);
};
