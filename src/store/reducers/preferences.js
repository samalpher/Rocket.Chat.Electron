import { app as mainApp, remote } from 'electron';
import {
	LOAD_PREFERENCES,
	SET_PREFERENCES,
	TOGGLE_SPELLCHECKING_DICTIONARY,
	LOAD_SPELLCHECKING_CONFIGURATION,
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
		case LOAD_PREFERENCES:
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

		case LOAD_SPELLCHECKING_CONFIGURATION: {
			({
				supportsMultipleDictionaries,
				availableDictionaries,
			} = payload);
			return state;
		}
	}

	return state;
};
