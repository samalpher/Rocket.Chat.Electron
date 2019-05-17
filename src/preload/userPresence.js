import idle from '@paulcbetts/system-idle-time';
import { getMeteor, getTracker, getGetUserPreference, getUserPresence } from './rocketChat';


const pollUserPresence = (UserPresence, maximumIdleTime) => {
	let wasUserPresent = false;

	return () => {
		let isUserPresent = true;

		try {
			const idleTime = idle.getIdleTime();
			isUserPresent = idleTime < maximumIdleTime;

			if (isUserPresent === wasUserPresent) {
				return;
			}

			if (isUserPresent) {
				UserPresence.setOnline();
			} else {
				UserPresence.setAway();
			}
		} catch (error) {
			console.error(error);
		} finally {
			wasUserPresent = isUserPresent;
		}
	};
};

const handleUserPresence = () => {
	const Meteor = getMeteor();
	const Tracker = getTracker();
	const getUserPreference = getGetUserPreference();
	const UserPresence = getUserPresence();

	if (!Meteor || !Tracker || !getUserPreference || !UserPresence) {
		return;
	}

	let intervalID;

	Tracker.autorun(() => {
		if (intervalID) {
			clearInterval(intervalID);
			intervalID = null;
		}

		const uid = Meteor.userId();

		if (!uid) {
			return;
		}

		delete UserPresence.awayTime;
		UserPresence.start();

		const isAutoAwayEnabled = getUserPreference(uid, 'enableAutoAway');

		if (!isAutoAwayEnabled) {
			UserPresence.setOnline();
			return;
		}

		const maximumIdleTime = (getUserPreference(uid, 'idleTimeLimit') || 300) * 1000;
		const idleTimeDetectionInterval = maximumIdleTime / 2;
		const callback = pollUserPresence(UserPresence, maximumIdleTime);

		intervalID = setInterval(callback, idleTimeDetectionInterval);
	});
};


export default () => {
	window.addEventListener('load', handleUserPresence);
};
