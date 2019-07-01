import {
	CERTIFICATES_LOADED,
	CLEAR_CERTIFICATES,
	CERTIFICATE_TRUSTED,
} from '../actions';


export const reducer = (state = {}, { type, payload }) => {
	switch (type) {
		case CERTIFICATES_LOADED:
			return { ...payload };

		case CLEAR_CERTIFICATES:
			return {};

		case CERTIFICATE_TRUSTED:
			return {
				...state,
				[payload.host]: payload.certificate,
			};
	}

	return state;
};
