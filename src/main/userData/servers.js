import { getStore } from '../store';
import {
	serversLoaded,
	showServer,
	showLanding,
	setPreferences,
} from '../../store/actions';
import { normalizeServerUrl } from '../../utils';
import { loadJson } from './fileSystem';
import { connectUserData } from './store';


const selectToUserData = ({ servers = [] }) => ({ servers });

const fetchFromUserData = async (servers) => {
	if (servers.length !== 0) {
		(await getStore()).dispatch(serversLoaded(servers));
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

	(await getStore()).dispatch(servers[0] ? showServer(servers[0].url) : showLanding());

	if (servers.length <= 1) {
		(await getStore()).dispatch(setPreferences({ hasSidebar: false }));
	}

	(await getStore()).dispatch(serversLoaded(servers));
};

const attachToStore = () => connectUserData(selectToUserData, fetchFromUserData);

export const useServers = () => {
	attachToStore();
};
