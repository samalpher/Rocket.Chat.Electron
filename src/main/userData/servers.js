import {
	serversLoaded,
	showServer,
	showLanding,
	setPreferences,
} from '../../actions';
import { normalizeServerUrl } from '../../utils';
import { loadJson } from './fileSystem';
import { connectUserData } from './store';


const selectToUserData = ({ servers = [] }) => ({ servers });

const fetchFromUserData = (dispatch) => async (servers) => {
	if (servers.length !== 0) {
		dispatch(serversLoaded(servers));
		return;
	}

	const appEntries = await loadJson('app', 'servers.json');
	const userEntries = await loadJson('user', 'servers.json');
	servers = [
		...(
			Object.entries(appEntries)
				.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
		),
		...(
			Object.entries(userEntries)
				.map(([title, url]) => ({ url: normalizeServerUrl(url), title }))
		),
	];

	dispatch(servers[0] ? showServer(servers[0].url) : showLanding());

	if (servers.length <= 1) {
		dispatch(setPreferences({ hasSidebar: false }));
	}

	dispatch(serversLoaded(servers));
};

export const useServers = ({ dispatch }) => {
	connectUserData(selectToUserData, fetchFromUserData(dispatch));
};
