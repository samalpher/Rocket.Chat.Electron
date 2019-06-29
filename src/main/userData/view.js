import { viewLoaded } from '../../store/actions';
import { getStore } from '../store';
import { connectUserData } from './store';


const selectToUserData = ({ view = {} }) => ({ view });

const fetchFromUserData = async (view) => {
	(await getStore()).dispatch(viewLoaded(view));
};

const attachToStore = () => connectUserData(selectToUserData, fetchFromUserData);

export const useView = () => {
	attachToStore();
};
