export const USER_DATA_LOADED = 'USER_DATA_LOADED';
export const RESET_USER_DATA = 'RESET_USER_DATA';

export const userDataLoaded = () => ({
	type: USER_DATA_LOADED,
});

export const resetUserData = () => ({
	type: RESET_USER_DATA,
});
