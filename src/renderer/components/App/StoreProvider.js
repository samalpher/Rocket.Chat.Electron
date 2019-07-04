import React from 'react';
import { Provider } from 'react-redux';
import { getStore } from '../../store';


export const StoreProvider = React.lazy(async () => {
	const store = await getStore();

	const StoreProvider = (props) =>
		<Provider store={store} {...props} />;

	return { default: StoreProvider };
});
