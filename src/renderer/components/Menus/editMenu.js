import { t } from 'i18next';
import { useSelector } from 'react-redux';
import { useActions } from './actions';


export const useEditMenuTemplate = () => {
	const {
		onClickUndo,
		onClickRedo,
		onClickCut,
		onClickCopy,
		onClickPaste,
		onClickSelectAll,
	} = useActions();

	return useSelector(({
		editFlags: {
			canUndo,
			canRedo,
			canCut,
			canCopy,
			canPaste,
			canSelectAll,
		},
	}) => ({
		label: t('menus.editMenu'),
		submenu: [
			{
				label: t('menus.undo'),
				accelerator: 'CommandOrControl+Z',
				enabled: canUndo,
				click: onClickUndo,
			},
			{
				label: t('menus.redo'),
				accelerator: process.platform === 'win32' ? 'Control+Y' : 'CommandOrControl+Shift+Z',
				enabled: canRedo,
				click: onClickRedo,
			},
			{ type: 'separator' },
			{
				label: t('menus.cut'),
				accelerator: 'CommandOrControl+X',
				enabled: canCut,
				click: onClickCut,
			},
			{
				label: t('menus.copy'),
				accelerator: 'CommandOrControl+C',
				enabled: canCopy,
				click: onClickCopy,
			},
			{
				label: t('menus.paste'),
				accelerator: 'CommandOrControl+V',
				enabled: canPaste,
				click: onClickPaste,
			},
			{
				label: t('menus.selectAll'),
				accelerator: 'CommandOrControl+A',
				enabled: canSelectAll,
				click: onClickSelectAll,
			},
		],
	}));
};
