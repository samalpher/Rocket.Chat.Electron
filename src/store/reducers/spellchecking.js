import {
	SPELLCHECKING_CONFIGURATION_LOADED,
} from '../actions';


const filterState = ({
	supportsMultipleDictionaries = false,
	dictionaryInstallationDirectory,
	availableDictionaries = [],
}) => ({
	supportsMultipleDictionaries,
	dictionaryInstallationDirectory,
	availableDictionaries,
});

export const reducer = (state = filterState({}), { type, payload }) => {
	switch (type) {
		case SPELLCHECKING_CONFIGURATION_LOADED:
			return filterState(payload);
	}

	return state;
};
