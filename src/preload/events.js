import { remote } from 'electron';
import { store } from '../store';
import { editFlagsUpdated, historyFlagsUpdated, setServerProperties } from '../store/actions';
import { queryEditFlags } from '../utils';
import { getServerUrl } from './getServerUrl';
const { getCurrentWebContents } = remote;


export default () => {
	document.addEventListener('dragover', (event) => event.preventDefault());
	document.addEventListener('drop', (event) => event.preventDefault());

	window.addEventListener('unread-changed', async (event) => {
		store.dispatch(setServerProperties({ url: await getServerUrl(), badge: event.detail }));
	});

	document.addEventListener('selectionchange', () => {
		store.dispatch(editFlagsUpdated(queryEditFlags()));
		store.dispatch(historyFlagsUpdated({
			canGoBack: getCurrentWebContents().canGoBack(),
			canGoForward: getCurrentWebContents().canGoForward(),
		}));
	});
};
