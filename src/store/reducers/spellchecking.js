import {
	LOAD_SPELLCHECKING_CONFIGURATION,
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
		case LOAD_SPELLCHECKING_CONFIGURATION:
			return filterState(payload);
	}

	return state;
};
