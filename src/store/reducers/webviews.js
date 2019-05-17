import {
	WEBVIEW_CREATED,
	WEBVIEW_DESTROYED,
} from '../actions';


export const reducer = (state = [], { type, payload }) => {
	switch (type) {
		case WEBVIEW_CREATED:
			return [
				...state,
				payload,
			];

		case WEBVIEW_DESTROYED:
			return state.filter((webview) => webview.url !== payload.url && webview.webContentsId !== payload.webContentsId);
	}

	return state;
};
