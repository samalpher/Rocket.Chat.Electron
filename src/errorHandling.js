import bugsnag from '@bugsnag/js';
import { app as mainApp, remote } from 'electron';
const app = mainApp || remote.app;


export const setupErrorHandling = (appType) => {
	const logAndQuit = (error) => {
		console.error(error && (error.stack || error));
		app.quit(1);
	};

	if (process.env.BUGSNAG_API_KEY) {
		bugsnag({
			apiKey: process.env.BUGSNAG_API_KEY,
			appVersion: app.getVersion(),
			appType,
			collectUserIp: false,
			onUncaughtException: logAndQuit,
			onUnhandledRejection: logAndQuit,
			releaseStage: process.env.NODE_ENV,
		});
		return;
	}

	process.on('uncaughtException', logAndQuit);
	process.on('unhandledRejection', logAndQuit);
};
