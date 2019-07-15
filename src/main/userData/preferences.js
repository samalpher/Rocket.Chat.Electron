import { preferencesLoaded } from '../../actions';
import { connectUserData } from './store';


const selectToUserData = ({ preferences = {} }) => ({ preferences });

const fetchFromUserData = (dispatch) => (preferences) => {
	dispatch(preferencesLoaded(preferences));
};

export const usePreferences = ({ dispatch }) => {
	connectUserData(selectToUserData, fetchFromUserData(dispatch));
};
