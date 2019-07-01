import { useDispatch } from 'react-redux';
import {
	showDownloads,
	showLanding,
	showPreferences,
} from '../../../../actions';


export const useRedux = () => {
	const dispatch = useDispatch();

	const handleShowLanding = () => {
		dispatch(showLanding());
	};

	const handleShowDownloads = () => {
		dispatch(showDownloads());
	};

	const handleShowPreferences = () => {
		dispatch(showPreferences());
	};

	return {
		handleShowLanding,
		handleShowDownloads,
		handleShowPreferences,
	};
};
