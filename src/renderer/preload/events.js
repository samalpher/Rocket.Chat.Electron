import { remote } from 'electron';
import { getStore } from '../store';
import { editFlagsUpdated, historyFlagsUpdated, setServerProperties } from '../../actions';
import { queryEditFlags } from '../../utils';
import { getServerUrl } from './getServerUrl';
const { getCurrentWebContents } = remote;


export default () => {
	document.addEventListener('dragover', (event) => event.preventDefault());
	document.addEventListener('drop', (event) => event.preventDefault());

	window.addEventListener('unread-changed', async (event) => {
		(await getStore()).dispatch(setServerProperties({ url: await getServerUrl(), badge: event.detail }));
	});

	document.addEventListener('selectionchange', async () => {
		(await getStore()).dispatch(editFlagsUpdated(queryEditFlags()));
		(await getStore()).dispatch(historyFlagsUpdated({
			canGoBack: getCurrentWebContents().canGoBack(),
			canGoForward: getCurrentWebContents().canGoForward(),
		}));
	});
};
