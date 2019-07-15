import { bindActionCreators } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { allDownloadsCleared } from '../../../actions';


export const useView = () => useSelector(({ view }) => view === 'downloads');

export const useDownloads = () => {
	const downloads = useSelector(({
		downloads,
		// update: {
		// 	download,
		// },
	}) => downloads);

	const dispatch = useDispatch();

	const clearAll = bindActionCreators(allDownloadsCleared, dispatch);

	return [downloads, clearAll];
};
