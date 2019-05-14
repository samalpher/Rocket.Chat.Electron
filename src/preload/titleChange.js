import { store } from '../store';
import { setServerProperties } from '../store/actions';
import { getMeteor, getTracker, getSettings } from './rocketChat';
import { getServerUrl } from './getServerUrl';


function handleTitleChange() {
	const Meteor = getMeteor();
	const Tracker = getTracker();
	const settings = getSettings();

	if (!Meteor || !Tracker || !settings) {
		return;
	}

	Meteor.startup(() => {
		Tracker.autorun(async () => {
			const siteName = settings.get('Site_Name');
			if (siteName) {
				store.dispatch(setServerProperties({ url: await getServerUrl(), title: siteName }));
			}
		});
	});
}


export default () => {
	window.addEventListener('load', handleTitleChange);
};
