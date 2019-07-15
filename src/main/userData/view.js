import { viewLoaded } from '../../actions';
import { connectUserData } from './store';


const selectToUserData = ({ view = {} }) => ({ view });

const fetchFromUserData = (dispatch) => (view) => {
	dispatch(viewLoaded(view));
};

export const useView = ({ dispatch }) => {
	connectUserData(selectToUserData, fetchFromUserData(dispatch));
};
