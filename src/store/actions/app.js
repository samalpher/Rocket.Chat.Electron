export const APP_LAUNCHED = 'APP_STARTED';
export const RESET_APP_DATA = 'RESET_APP_DATA';

export const appLaunched = (args) => ({
	type: APP_LAUNCHED,
	payload: args,
});

export const resetAppData = () => ({
	type: RESET_APP_DATA,
});
