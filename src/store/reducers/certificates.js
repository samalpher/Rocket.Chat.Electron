import {
	CERTIFICATES_LOADED,
	CLEAR_CERTIFICATES,
	ADD_CERTIFICATE,
} from '../actions';


export const reducer = (state = {}, { type, payload }) => {
	switch (type) {
		case CERTIFICATES_LOADED:
			return { ...payload };

		case CLEAR_CERTIFICATES:
			return {};

		case ADD_CERTIFICATE:
			return {
				...state,
				[payload.host]: payload.certificate,
			};
	}

	return state;
};
