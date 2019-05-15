import { app as mainApp, remote } from 'electron';
import {
	PREFERENCES_LOADED,
	SET_PREFERENCES,
	TOGGLE_SPELLCHECKING_DICTIONARY,
	SPELLCHECKING_CONFIGURATION_LOADED,
} from '../actions';
const app = remote ? remote.app : mainApp;


let supportsMultipleDictionaries = true;
let availableDictionaries = [];

const filterDictionaries = (dictionaries) => (
	Array.from(
		new Set(
			dictionaries
				.flatMap((dictionary) => {
					const matches = /^(\w+?)[-_](\w+)$/.exec(dictionary);
					return matches ?
						[`${ matches[1] }_${ matches[2] }`, `${ matches[1] }-${ matches[2] }`, matches[1]] :
						[dictionary];
				})
				.filter((dictionary) => availableDictionaries.includes(dictionary))
		)
	)
		.slice(...supportsMultipleDictionaries ? [] : [0, 1])
);

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

		case TOGGLE_SPELLCHECKING_DICTIONARY: {
			const { enabledDictionaries } = state;
			const { dictionary, enabled } = payload;
			return filterState({
				...state,
				enabledDictionaries: filterDictionaries(
					enabled ?
						[dictionary, ...enabledDictionaries] :
						enabledDictionaries.filter((_dictionary) => _dictionary !== dictionary)
				),
			});
		}

		case SPELLCHECKING_CONFIGURATION_LOADED: {
			({
				supportsMultipleDictionaries,
				availableDictionaries,
			} = payload);
			return state;
		}
	}

	return state;
};
