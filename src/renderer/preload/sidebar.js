import { select, take } from 'redux-saga/effects';
import { getStore, getSaga } from '../store';
import { setServerProperties } from '../../actions';
import { getServerUrl } from './getServerUrl';


let style = {};

const handleStyle = async (newStyle) => {
	if (newStyle.color !== style.color || newStyle.background !== style.background) {
		style = newStyle;
		(await getStore()).dispatch(setServerProperties({ url: await getServerUrl(), style }));
	}
};

const getStyleFromSidebar = (sidebar) => {
	const { color, background } = window.getComputedStyle(sidebar);
	const sidebarItem = sidebar.querySelector('.sidebar-item');
	const itemColor = sidebarItem && window.getComputedStyle(sidebarItem).color;
	handleStyle({ color: itemColor || color, background });
};

const getStyleFromPage = (fullpage) => {
	const { color, background } = window.getComputedStyle(fullpage);
	handleStyle({ color, background });
};

const createStylesObserver = (element, getStylesFrom) => {
	const observer = new MutationObserver(() => {
		getStylesFrom(element);
	});

	observer.observe(element, { attributes: true });
	getStylesFrom(element);

	return observer;
};

let observer;

const requestSidebarStyle = () => {
	const sidebar = document.querySelector('.sidebar');
	if (sidebar) {
		observer && observer.disconnect();
		observer = createStylesObserver(sidebar, getStyleFromSidebar);
		return;
	}

	const fullpage = document.querySelector('.full-page');
	if (fullpage) {
		observer = createStylesObserver(fullpage, getStyleFromPage);
		setTimeout(requestSidebarStyle, 1000);
		return;
	}

	requestAnimationFrame(requestSidebarStyle);
};

const ensureSidebarSpacingToTitleBarButtons = async () => {
	if (process.platform !== 'darwin') {
		return;
	}

	let hasSidebar;

	(await getSaga()).run(function* watchSidebar() {
		while (true) {
			yield take('*');

			const { preferences: { hasSidebar: hasSidebarNow } } = yield select();
			if (hasSidebar !== hasSidebarNow) {
				hasSidebar = hasSidebarNow;

				const style = document.getElementById('electronStyle') || document.createElement('style');
				style.setAttribute('id', 'electronStyle');
				style.innerHTML = `
				.sidebar {
					padding-top: ${ !hasSidebar ? '10px' : '0' };
					transition:
						padding .3s ease-in-out,
						margin .3s ease-in-out;
				}`;
				document.head.appendChild(style);
			}
		}
	});
};

export default () => {
	window.addEventListener('load', ensureSidebarSpacingToTitleBarButtons);
	window.addEventListener('load', requestSidebarStyle);
};
