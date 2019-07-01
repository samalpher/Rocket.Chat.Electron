export const FORMAT_BUTTON_TOUCHED = 'FORMAT_BUTTON_TOUCHED';

export const formatButtonTouched = (buttonId) => ({
	type: FORMAT_BUTTON_TOUCHED,
	payload: buttonId,
});
