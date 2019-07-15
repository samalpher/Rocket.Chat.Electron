import { app } from 'electron';
import jetpack from 'fs-jetpack';
import { takeEvery } from 'redux-saga/effects';
import { data as debug } from '../../debug';
import { RESET_USER_DATA } from '../../actions';


const resetUserDataCommandLineFlag = '--reset-user-data';

export const isRequestingUserDataReset = (args) => args.includes(resetUserDataCommandLineFlag);

export const resetUserData = () => {
	jetpack.remove(app.getPath('userData'));
	debug('user data purged');
	app.relaunch({ args: [process.argv[1]] });
	app.exit(0);
};

const requestUserDataReset = () => {
	debug('requesting user data reset');
	app.relaunch({ args: [process.argv[1], resetUserDataCommandLineFlag] });
	app.quit();
};

export const useUserDataReset = ({ runSaga }) => {
	runSaga(function* () {
		yield takeEvery(RESET_USER_DATA, function* () {
			requestUserDataReset();
		});
	});
};
