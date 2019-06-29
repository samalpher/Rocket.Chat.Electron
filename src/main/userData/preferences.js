import { getStore } from '../store';
import { preferencesLoaded } from '../../store/actions';
import { connectUserData } from './store';


const selectToUserData = ({ preferences = {} }) => ({ preferences });

const fetchFromUserData = async (preferences) => {
	(await getStore()).dispatch(preferencesLoaded(preferences));
};

const attachToStore = () => connectUserData(selectToUserData, fetchFromUserData);

export const usePreferences = async () => {
	attachToStore();
};
