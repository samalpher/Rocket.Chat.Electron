import { remote } from 'electron';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mainWindowStateUpdated } from '../../../../actions';
import { withDebounce } from '../../../../utils/decorators';


const applyBounds = (mainWindow, { x, y, width, height }) => {
	if (!x || !y || !width || !height) {
		({ x, y, width, height } = mainWindow.getNormalBounds());
	}

	const isInsideSomeDisplay = remote.screen.getAllDisplays().some(({ workArea }) => (
		x >= workArea.x &&
		y >= workArea.y &&
		x + width <= workArea.x + workArea.width &&
		y + height <= workArea.y + workArea.height
	));

	if (!isInsideSomeDisplay) {
		const { bounds } = screen.getPrimaryDisplay();
		x = Math.round((bounds.width - width) / 2);
		y = Math.round((bounds.height - height) / 2);
	}

	mainWindow.setBounds({ x, y, width, height });
};

const applyVisibility = (mainWindow, { isMaximized, isMinimized, isHidden }, hideOnClose) => {
	if (isMaximized) {
		mainWindow.maximize();
	}

	if (isMinimized) {
		mainWindow.minimize();
	}

	if (hideOnClose) {
		isHidden ? mainWindow.hide() : mainWindow.show();
		return;
	}

	if (process.platform === 'darwin') {
		isHidden ? mainWindow.hide() : mainWindow.show();
		return;
	}

	if (isHidden) {
		mainWindow.minimize();
		mainWindow.showInactive();
	} else {
		mainWindow.show();
	}
};

const fetchState = (mainWindow) => {
	if (mainWindow.isDestroyed()) {
		return;
	}

	const state = {};
	({
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
	} = mainWindow.getNormalBounds());
	state.isMinimized = mainWindow.isMinimized();
	state.isMaximized = mainWindow.isMaximized();
	state.isHidden = !mainWindow.isVisible();
	return state;
};

const leaveFullScreen = async (mainWindow) => {
	await new Promise((resolve) => {
		if (mainWindow.isFullScreen()) {
			mainWindow.once('leave-full-screen', resolve);
			mainWindow.setFullScreen(false);
			return;
		}
		resolve();
	});
	mainWindow.blur();
};

const close = (mainWindow, hideOnClose) => {
	if (process.platform === 'darwin') {
		mainWindow.hide();
		return;
	}

	if (process.platform === 'win32') {
		hideOnClose ? mainWindow.hide() : mainWindow.minimize();
		return;
	}

	hideOnClose ? mainWindow.hide() : mainWindow.destroy();
};

export default (mainWindow) => {
	const [state, hideOnClose] = useSelector(({
		mainWindow,
		preferences: {
			hasTray,
		},
	}) => [mainWindow, hasTray]);

	const dispatch = useDispatch();

	const handleWindowStateChange = withDebounce(100, () => {
		const state = fetchState(mainWindow);
		dispatch(mainWindowStateUpdated(state));
	});

	useEffect(() => {
		mainWindow.on('move', handleWindowStateChange);
		mainWindow.on('resize', handleWindowStateChange);
		mainWindow.on('minimize', handleWindowStateChange);
		mainWindow.on('restore', handleWindowStateChange);
		mainWindow.on('maximize', handleWindowStateChange);
		mainWindow.on('unmaximize', handleWindowStateChange);
		mainWindow.on('show', handleWindowStateChange);
		mainWindow.on('hide', handleWindowStateChange);

		return () => {
			mainWindow.off('move', handleWindowStateChange);
			mainWindow.off('resize', handleWindowStateChange);
			mainWindow.off('minimize', handleWindowStateChange);
			mainWindow.off('restore', handleWindowStateChange);
			mainWindow.off('maximize', handleWindowStateChange);
			mainWindow.off('unmaximize', handleWindowStateChange);
			mainWindow.off('show', handleWindowStateChange);
			mainWindow.off('hide', handleWindowStateChange);
		};
	}, []);

	const handleClose = async (event) => {
		event.preventDefault();

		await leaveFullScreen(mainWindow);

		if (hideOnClose) {
			close(mainWindow, hideOnClose);
			handleWindowStateChange();
			return;
		}

		handleWindowStateChange();
		close(mainWindow, hideOnClose);
	};

	useEffect(() => {
		mainWindow.on('close', handleClose);

		return () => {
			mainWindow.off('close', handleClose);
		};
	}, [hideOnClose]);

	useEffect(() => {
		applyBounds(mainWindow, state);
		applyVisibility(mainWindow, state, hideOnClose);
	}, []);
};
