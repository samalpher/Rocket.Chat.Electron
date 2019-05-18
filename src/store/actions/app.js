export const APP_LAUNCHED = 'APP_STARTED';
export const APP_READY = 'APP_READY';
export const APP_ACTIVATED = 'APP_ACTIVATED';
export const APP_WILL_QUIT = 'APP_WILL_QUIT';
export const APP_SECOND_INSTANCE_LAUNCHED = 'APP_SECOND_INSTANCE_LAUNCHED';
export const RESET_APP_DATA = 'RESET_APP_DATA';

export const appLaunched = (args) => ({
	type: APP_LAUNCHED,
	payload: args,
});

export const appReady = () => ({
	type: APP_READY,
});

export const appActivated = () => ({
	type: APP_ACTIVATED,
});

export const appWillQuit = () => ({
	type: APP_WILL_QUIT,
});

export const appSecondInstanceLaunched = (args) => ({
	type: APP_SECOND_INSTANCE_LAUNCHED,
	payload: args,
});

export const resetAppData = () => ({
	type: RESET_APP_DATA,
});
