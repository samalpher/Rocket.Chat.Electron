import { desktopCapturer } from 'electron';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { screensharingSourceSelected } from '../../../store/actions';


export const useModal = () => {
	const isOpen = useSelector(({ modal }) => modal === 'screenshare');

	return [isOpen];
};

export const useScreensharingSources = () => {
	const isOpen = useSelector(({ modal }) => modal === 'screenshare');

	const [sources, setSources] = useState([]);

	useEffect(() => {
		if (isOpen && sources.length === 0) {
			desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
				if (error) {
					throw error;
				}

				setSources(sources);
			});
		}

		if (!isOpen && sources.length > 0) {
			setSources([]);
		}
	}, [isOpen]);

	const dispatch = useDispatch();

	const selectSource = (id) => {
		dispatch(screensharingSourceSelected(id));
	};

	return [sources, selectSource];
};
