import { useSelector } from 'react-redux';
import { clearAllDownloads } from '../../store/actions';


export const useView = () => useSelector(({ view }) => view === 'downloads');

export const useDownloads = () => {
	const downloads = useSelector(({
		downloads,
		// update: {
		// 	download,
		// },
	}) => downloads);

	const clearAll = () => {
		clearAllDownloads();
	};

	return [downloads, clearAll];
};
