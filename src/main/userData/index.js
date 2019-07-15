import { data as debug } from '../../debug';
import { getStore } from '../store';
import { compose, withDebounce, withArgumentsReducer } from '../../utils/decorators';
import { connect } from '../../utils/store';
import { loadJsonSync, writeJson } from './fileSystem';


let storedData = {};

export const restoreState = () => {
	storedData = loadJsonSync('user', 'state.json');
};

const withCumulativeDebounce = compose(
	withDebounce(500, { accumulate: true }),
	withArgumentsReducer(([x = {}], y) => [Object.assign(x, y)]),
);

const storeUserData = withCumulativeDebounce(async (values) => {
	Object.assign(storedData, values);
	await writeJson('user', 'state.json', storedData);
	debug('%o persisted', Object.keys(values));
});

export const connectUserData = (selector, fetcher) => {
	const [[key, defaultValue]] = Object.entries(selector({}));
	debug('watching %o', key);
	const storedValue = storedData.hasOwnProperty(key) ? storedData[key] : defaultValue;
	fetcher(storedValue);
	return connect(getStore(), selector)((state) => storeUserData(state));
};
