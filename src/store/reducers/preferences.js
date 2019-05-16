import { app as mainApp, remote } from 'electron';
import {
	PREFERENCES_LOADED,
	SET_PREFERENCES,
	SPELLCHECKING_DICTIONARIES_ENABLED,
} from '../actions';
const app = remote ? remote.app : mainApp;


const filterState = ({
	hasTray = process.platform !== 'linux',
	hasMenus = true,
	hasSidebar = true,
	showWindowOnUnreadChanged = false,
	enabledDictionaries = [app.getLocale()],
}) => ({
	hasTray,
	hasMenus,
	hasSidebar,
	showWindowOnUnreadChanged,
	enabledDictionaries,
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
	}

	return state;
};
