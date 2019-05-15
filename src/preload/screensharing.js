import { store, connect } from '../store';
import { hideModal, showScreenshareModal } from '../store/actions';
import { getServerUrl } from './getServerUrl';


export default async () => {
	const serverUrl = await getServerUrl();

	connect(({ screensharing }) => screensharing)(({ url, sourceId }) => {
		if (sourceId && url === serverUrl) {
			window.parent.postMessage({ sourceId }, '*');
			store.dispatch(hideModal());
		}
	});

	window.addEventListener('get-sourceId', async () => {
		store.dispatch(showScreenshareModal(serverUrl));
	});
};
