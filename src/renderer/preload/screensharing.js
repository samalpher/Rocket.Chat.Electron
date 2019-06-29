import { getStore } from '../store';
import { hideModal, showScreenshareModal } from '../../store/actions';
import { connect } from '../../utils/store';
import { getServerUrl } from './getServerUrl';


export default async () => {
	const serverUrl = await getServerUrl();

	connect(getStore(), ({ screensharing }) => screensharing)(async ({ url, sourceId }) => {
		if (sourceId && url === serverUrl) {
			window.parent.postMessage({ sourceId }, '*');
			(await getStore()).dispatch(hideModal());
		}
	});

	window.addEventListener('get-sourceId', async () => {
		(await getStore()).dispatch(showScreenshareModal(serverUrl));
	});
};
