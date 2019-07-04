import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { delay, takeLeading } from 'redux-saga/effects';
import { useSaga } from '../App/SagaMiddlewareProvider';
import {
	CHECKING_FOR_UPDATE_ERRORED,
	UPDATE_NOT_AVAILABLE,
	hideModal,
	checkForUpdate as checkForUpdateAction,
	setAutoUpdate as setAutoUpdateAction,
} from '../../../actions';


export const useModal = () => {
	const isOpen = useSelector(({ modal }) => modal === 'about');

	const dispatch = useDispatch();

	const close = () => {
		dispatch(hideModal());
	};

	return [isOpen, close];
};

export const useUpdate = () => {
	const state = useSelector(({
		update: {
			configuration: {
				canUpdate,
				canAutoUpdate,
				canSetAutoUpdate,
			},
			checking,
		},
	}) => ({ canUpdate, canAutoUpdate, canSetAutoUpdate, checking }));

	const dispatch = useDispatch();

	const checkForUpdate = () => {
		dispatch(checkForUpdateAction());
	};

	const setAutoUpdate = (checked) => {
		dispatch(setAutoUpdateAction(checked));
	};

	const [checkingMessage, setCheckingMessage] = useState(null);

	const { t } = useTranslation();

	function* didCheckingForUpdateErrored() {
		setCheckingMessage(t('dialog.about.errorWhileLookingForUpdates'));
		yield delay(5000);
		setCheckingMessage(null);
	}

	function* didUpdateNotAvailable() {
		setCheckingMessage(t('dialog.about.noUpdatesAvailable'));
		yield delay(5000);
		setCheckingMessage(null);
	}

	useSaga(function* watchUpdatesActions() {
		yield takeLeading(CHECKING_FOR_UPDATE_ERRORED, didCheckingForUpdateErrored);
		yield takeLeading(UPDATE_NOT_AVAILABLE, didUpdateNotAvailable);
	}, []);

	return {
		...state,
		checkingMessage,
		checkForUpdate,
		setAutoUpdate,
	};
};
