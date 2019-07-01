import { bindActionCreators } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllDownloads } from '../../../actions';


export const useView = () => useSelector(({ view }) => view === 'downloads');

export const useDownloads = () => {
	const downloads = useSelector(({
		downloads,
		// update: {
		// 	download,
		// },
	}) => downloads);

	const dispatch = useDispatch();

	const clearAll = bindActionCreators(clearAllDownloads, dispatch);

	return [downloads, clearAll];
};
