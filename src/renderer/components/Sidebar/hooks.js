import { useSelector } from 'react-redux';


export const useRedux = () => useSelector(({
	loading,
	preferences: {
		hasSidebar,
		view,
	},
	servers,
}) => {
	const {
		background,
		color,
	} = (view.url && servers.filter(({ url }) => view.url === url).map(({ style }) => style)[0]) || {};

	return {
		visible: !loading && hasSidebar,
		background,
		color,
	};
});
