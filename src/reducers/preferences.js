import { app as mainApp, remote } from 'electron';
import {
	PREFERENCES_LOADED,
	SET_PREFERENCES,
	SPELLCHECKING_DICTIONARIES_ENABLED,
	UPDATE_CONFIGURATION_LOADED,
	AUTO_UPDATE_SET,
	UPDATE_SKIPPED,
	VIEW_LOADED,
	SHOW_LANDING,
	SHOW_SERVER,
	SHOW_DOWNLOADS,
	SHOW_PREFERENCES,
	REMOVE_SERVER_FROM_URL,
} from '../actions';
const app = remote ? remote.app : mainApp;


const filterState = ({
	hasTray = process.platform !== 'linux',
	hasMenus = true,
	hasSidebar = true,
	showWindowOnUnreadChanged = false,
	enabledDictionaries = [app.getLocale()],
	view = 'landing',
	canUpdate = false,
	canAutoUpdate = false,
	skippedVersion = null,
}) => ({
	hasTray,
	hasMenus,
	hasSidebar,
	showWindowOnUnreadChanged,
	enabledDictionaries,
	view,
	canUpdate,
	canAutoUpdate,
	skippedVersion,
});

export const reducer = (state = filterState({}), { type, payload }) => {
	switch (type) {
		case PREFERENCES_LOADED:
			return filterState({ ...payload });

		case SET_PREFERENCES:
			return filterState({ ...state, ...payload });

		case SPELLCHECKING_DICTIONARIES_ENABLED:
			return {
				...state,
				enabledDictionaries: payload,
			};

		case UPDATE_CONFIGURATION_LOADED:
			return filterState({ ...state, ...payload });

		case AUTO_UPDATE_SET:
			return {
				...state,
				canAutoUpdate: !!payload,
			};

		case UPDATE_SKIPPED:
			return {
				...state,
				skippedVersion: payload,
			};

		case VIEW_LOADED:
			return {
				...state,
				view: payload,
			};

		case SHOW_LANDING:
			return {
				...state,
				view: 'landing',
			};

		case SHOW_SERVER:
			return {
				...state,
				view: { url: payload },
			};

		case SHOW_DOWNLOADS:
			return {
				...state,
				view: 'downloads',
			};

		case SHOW_PREFERENCES:
			return {
				...state,
				view: 'preferences',
			};

		case REMOVE_SERVER_FROM_URL:
			return {
				...state,
				view: state.url === payload ? 'landing' : state,
			};
	}

	return state;
};
