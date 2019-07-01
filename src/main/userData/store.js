import ElectronStore from 'electron-store';
import { data as debug } from '../../debug';
import { getStore } from '../store';
import { userDataLoaded } from '../../actions';
import { compose, withDebounce, withArgumentsReducer } from '../../utils/decorators';
import { connect } from '../../utils/store';


let electronStore;

export const createElectronStore = async () => {
	electronStore = new ElectronStore();

	(await getStore()).dispatch(userDataLoaded());
};

const withCumulativeDebounce = compose(
	withDebounce(500, { accumulate: true }),
	withArgumentsReducer(([x = {}], y) => [Object.assign(x, y)]),
);

const storeUserData = withCumulativeDebounce((values) => {
	electronStore.set(values);
	debug('%o persisted', Object.keys(values));
});

export const connectUserData = (selector, fetcher) => {
	const [[key, defaultValue]] = Object.entries(selector({}));
	debug('watching %o', key);
	const storedValue = electronStore.get(key, defaultValue);
	fetcher(storedValue);
	return connect(getStore(), selector)((state) => storeUserData(state));
};
