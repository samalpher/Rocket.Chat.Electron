import { ipcRenderer } from 'electron';
import { sidebarStyleChanged, setSidebarSpacingForTitleBarButtons } from './channels';


let style = {};

const handleStyle = (newStyle) => {
	if (newStyle.color !== style.color || newStyle.background !== style.background) {
		style = newStyle;
		ipcRenderer.sendToHost(sidebarStyleChanged, style);
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

export default () => {
	ipcRenderer.on(setSidebarSpacingForTitleBarButtons, (event, hasSpacing) => {
		const style = document.getElementById('electronStyle') || document.createElement('style');
		style.setAttribute('id', 'electronStyle');
		style.innerHTML = `
		.sidebar {
			padding-top: ${ hasSpacing ? '10px' : '0' };
			transition:
				padding .3s ease-in-out,
				margin .3s ease-in-out;
		}`;
		document.head.appendChild(style);
	});

	window.addEventListener('load', requestSidebarStyle);
};
