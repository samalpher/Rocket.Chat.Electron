import { remote, shell } from 'electron';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
	showAboutModal,
	showMainWindow,
	showLanding,
	reloadWebview,
	clearCertificates,
	openDevToolsForWebview,
	goBackOnWebview,
	goForwardOnWebview,
	setPreferences,
	resetZoom,
	zoomIn,
	zoomOut,
	showServer,
	resetUserData,
} from '../../../actions';
import { useTextEditActions } from '../../hooks/textEditActions';


export const useActions = () => {
	const dispatch = useDispatch();

	const { t } = useTranslation();

	const onClickAbout = () => {
		dispatch(showAboutModal());
	};

	const onClickAddNewServer = () => {
		dispatch(showMainWindow());
		dispatch(showLanding());
	};

	const onClickQuit = () => {
		remote.app.quit();
	};

	const {
		undo: onClickUndo,
		redo: onClickRedo,
		cut: onClickCut,
		copy: onClickCopy,
		paste: onClickPaste,
		selectAll: onClickSelectAll,
	} = useTextEditActions();

	const activeServerUrl = useSelector(({ view: { url } = {} }) => url);

	const onClickReload = () => {
		dispatch(reloadWebview({ url: activeServerUrl }));
	};

	const onClickReloadIgnoringCache = () => {
		dispatch(reloadWebview({ url: activeServerUrl, ignoringCache: true }));
	};

	const onClickClearTrustedCertificates = () => {
		dispatch(clearCertificates());
	};

	const onClickOpenDevTools = () => {
		dispatch(openDevToolsForWebview({ url: activeServerUrl }));
	};

	const onClickGoBack = () => {
		dispatch(goBackOnWebview({ url: activeServerUrl }));
	};

	const onClickGoForward = () => {
		dispatch(goForwardOnWebview({ url: activeServerUrl }));
	};

	const onClickShowTray = ({ checked }) => {
		dispatch(setPreferences({ hasTray: checked }));
	};

	const onClickShowMenus = ({ checked }) => {
		dispatch(setPreferences({ hasMenus: checked }));
	};

	const onClickShowSidebar = ({ checked }) => {
		dispatch(setPreferences({ hasSidebar: checked }));
	};

	const onClickResetZoom = () => {
		dispatch(resetZoom());
	};

	const onClickZoomIn = () => {
		dispatch(zoomIn());
	};

	const onClickZoomOut = () => {
		dispatch(zoomOut());
	};

	const onClickSelectServer = ({ url }) => () => {
		dispatch(showMainWindow());
		dispatch(showServer(url));
	};

	const onClickReloadApp = () => {
		remote.getCurrentWindow().reload();
	};

	const onClickToggleAppDevTools = () => {
		remote.getCurrentWindow().toggleDevTools();
	};

	const onClickShowWindowOnUnreadChanged = ({ checked }) => {
		dispatch(setPreferences({ showWindowOnUnreadChanged: checked }));
	};

	const onClickDocumentation = () => {
		shell.openExternal('https://rocket.chat/docs');
	};

	const onClickReportIssue = () => {
		shell.openExternal('https://github.com/RocketChat/Rocket.Chat.Electron/issues/new');
	};

	const onClickResetUserData = async () => {
		const shouldReset = await new Promise((resolve) => {
			remote.dialog.showMessageBox({
				title: t('dialog.resetUserData.title'),
				message: t('dialog.resetUserData.message'),
				type: 'question',
				buttons: [
					t('dialog.resetUserData.yes'),
					t('dialog.resetUserData.cancel'),
				],
				defaultId: 1,
				cancelId: 1,
			}, (response) => resolve(response === 0));
		});
		if (shouldReset) {
			dispatch(resetUserData());
		}
	};

	const onClickLearnMore = () => {
		shell.openExternal('https://rocket.chat');
	};

	return {
		onClickAbout,
		onClickAddNewServer,
		onClickQuit,
		onClickUndo,
		onClickRedo,
		onClickCut,
		onClickCopy,
		onClickPaste,
		onClickSelectAll,
		onClickReload,
		onClickReloadIgnoringCache,
		onClickClearTrustedCertificates,
		onClickOpenDevTools,
		onClickGoBack,
		onClickGoForward,
		onClickShowTray,
		onClickShowMenus,
		onClickShowSidebar,
		onClickResetZoom,
		onClickZoomIn,
		onClickZoomOut,
		onClickSelectServer,
		onClickReloadApp,
		onClickToggleAppDevTools,
		onClickShowWindowOnUnreadChanged,
		onClickDocumentation,
		onClickReportIssue,
		onClickResetUserData,
		onClickLearnMore,
	};
};
