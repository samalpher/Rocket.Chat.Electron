import { remote } from 'electron';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipUpdate, hideModal, downloadUpdate } from '../../store/actions';
const { app, dialog, getCurrentWindow } = remote;


export const useModal = () => {
	const isOpen = useSelector(({ modal }) => modal === 'update');

	const dispatch = useDispatch();

	const close = () => {
		dispatch(hideModal());
	};

	return [isOpen, close];
};

export const useUpdate = () => {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const newVersion = useSelector(({
		update: {
			version,
		},
	}) => version);

	const warnItWillSkipVersion = () => new Promise((resolve) => {
		dialog.showMessageBox(getCurrentWindow(), {
			title: t('dialog.updateSkip.title'),
			message: t('dialog.updateSkip.message'),
			type: 'warning',
			buttons: [t('dialog.updateSkip.ok')],
			defaultId: 0,
		}, () => resolve());
	});

	const informItWillDownloadUpdate = () => new Promise((resolve) => {
		dialog.showMessageBox(getCurrentWindow(), {
			title: t('dialog.updateDownloading.title'),
			message: t('dialog.updateDownloading.message'),
			type: 'info',
			buttons: [t('dialog.updateDownloading.ok')],
			defaultId: 0,
		}, () => resolve());
	});

	const skip = async () => {
		await warnItWillSkipVersion();
		dispatch(skipUpdate());
	};

	const install = async () => {
		await informItWillDownloadUpdate();
		dispatch(downloadUpdate());
	};

	return {
		currentVersion: app.getVersion(),
		newVersion,
		skip,
		install,
	};
};
