export const SHOW_ABOUT_MODAL = 'SHOW_ABOUT_MODAL';
export const SHOW_SCREENSHARE_MODAL = 'SHOW_SCREENSHARE_MODAL';
export const SHOW_UPDATE_MODAL = 'SHOW_UPDATE_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const showAboutModal = () => ({
	type: SHOW_ABOUT_MODAL,
});

export const showScreenshareModal = (url) => ({
	type: SHOW_SCREENSHARE_MODAL,
	payload: url,
});

export const showUpdateModal = () => ({
	type: SHOW_UPDATE_MODAL,
});

export const hideModal = () => ({
	type: HIDE_MODAL,
});
