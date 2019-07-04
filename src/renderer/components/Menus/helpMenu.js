import { remote } from 'electron';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useActions } from './actions';

export const useHelpMenuTemplate = () => {
	const appName = remote.app.getName();

	const { t } = useTranslation();

	const {
		onClickDocumentation,
		onClickReportIssue,
		onClickResetUserData,
		onClickLearnMore,
		onClickAbout,
	} = useActions();

	return useSelector(() => ({
		label: t('menus.helpMenu'),
		role: 'help',
		submenu: [
			{
				label: t('menus.documentation'),
				click: onClickDocumentation,
			},
			{ type: 'separator' },
			{
				label: t('menus.reportIssue'),
				click: onClickReportIssue,
			},
			{
				label: t('menus.resetUserData'),
				click: onClickResetUserData,
			},
			{ type: 'separator' },
			{
				label: t('menus.learnMore'),
				click: onClickLearnMore,
			},
			...(process.platform !== 'darwin' ? [
				{
					label: t('menus.about', { appName }),
					click: onClickAbout,
				},
			] : []),
		],
	}));
};
