import { preferencesLoaded, updateConfigurationLoaded } from '../../actions';
import { connectUserData } from '.';
import { purgeFile, loadJson } from './fileSystem';


const selectToUserData = (getState) => () => (({ preferences }) => ({ preferences }))(getState());

const loadUpdateConfiguration = async (dispatch, { canUpdate, canAutoUpdate, skippedVersion }) => {
	const appUpdateConfiguration = await loadJson('app', 'update.json');
	const userUpdateConfiguration = await loadJson('user', 'update.json');

	const adminConfiguration = !!appUpdateConfiguration.forced;

	const isUpdatePossible = (
		(process.platform === 'linux' && Boolean(process.env.APPIMAGE)) ||
		(process.platform === 'win32' && !process.windowsStore) ||
		(process.platform === 'darwin' && !process.mas)
	);

	const updateConfiguration = {
		adminConfiguration,
		canUpdate: isUpdatePossible && (
			adminConfiguration ?
				(appUpdateConfiguration.canUpdate !== false || true) :
				(userUpdateConfiguration.canUpdate !== false || canUpdate || true)
		),
		canAutoUpdate: (
			adminConfiguration ?
				(appUpdateConfiguration.autoUpdate !== false || true) :
				(userUpdateConfiguration.autoUpdate !== false || canAutoUpdate || true)
		),
		canSetAutoUpdate: !appUpdateConfiguration.forced || appUpdateConfiguration.autoUpdate !== false,
		skippedVersion: (
			adminConfiguration ?
				(appUpdateConfiguration.skip || null) :
				(userUpdateConfiguration.skip || skippedVersion || null)
		),
	};

	await purgeFile('user', 'update.json');

	dispatch(updateConfigurationLoaded(updateConfiguration));
};

const fetchFromUserData = (dispatch) => (preferences) => {
	dispatch(preferencesLoaded(preferences));
	loadUpdateConfiguration(dispatch, preferences);
};

export const usePreferences = ({ getState, dispatch }) => {
	connectUserData(selectToUserData(getState), fetchFromUserData(dispatch));
};
