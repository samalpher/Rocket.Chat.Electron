export const APP_ACTIVATED = 'APP_ACTIVATED';
export const APP_WILL_QUIT = 'APP_WILL_QUIT';
export const APP_SECOND_INSTANCE_LAUNCHED = 'APP_SECOND_INSTANCE_LAUNCHED';

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
