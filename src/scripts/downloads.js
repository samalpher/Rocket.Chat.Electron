import { shell } from 'electron';
import { takeEvery } from 'redux-saga/effects';
import i18n from '../i18n';
import { sagaMiddleware } from '../store';
import { DOWNLOAD_STARTED, DOWNLOAD_UPDATED } from '../store/actions';


const formatMemorySize = (fileBytes) => {
	const formats = ['Bytes', 'KB', 'MB', 'GB'];
	const calcFormat = Math.floor(Math.log(fileBytes) / Math.log(1024));
	return `${ parseFloat((fileBytes / Math.pow(1024, calcFormat)).toFixed(2)) } ${ formats[calcFormat] }`;
};

const createStorage = async () => {
	const openRequest = indexedDB.open('rocket.chat-db', 1);

	openRequest.onupgradeneeded = ({ target: { result: db } }) => {
		if (!db.objectStoreNames.contains('downloads')) {
			const downloadManager = db.createObjectStore('downloads', { keyPath: 'creationDate', autoIncrement: false });
			downloadManager.createIndex('fileState', 'fileState', { unique: false });
		}
	};

	return await new Promise((resolve, reject) => {
		openRequest.onsuccess = ({ target: { result: db } }) => resolve(db);
		openRequest.onerror = (error) => reject(error);
	});
};

class DownloadManager {

	/**
	 * create database
	 * register all needed html elements
	 * register click event
	 * register all events
	 */
	initialize() {
		/**
		 * initialize database to save download items
		 */
		createStorage().then((db) => {
			this.db = db;
		});

		/**
		 * set downloadmanager state
		 */
		this.downloadManagerWindowIsActive = false;

		/**
		 * load all divs
		 */
		this.downloadManagerItems = document.querySelector('.app-download-manager-items');
		this.downloadManagerWindow = document.querySelector('.app-download-manager');
		this.downloadManagerButton = document.querySelector('.sidebar__submenu-action');
		this.downloadManagerTitle = document.querySelector('.app-download-manager-title');
		this.downloadManagerTitle.innerText = i18n.__('sidebar.downloadManager.title');
		/**
		 * downloadManager Button events
		 */
		this.downloadManagerClearDownloadsButton = document.querySelector('.app-download-manager-clear-action');
		this.downloadManagerClearDownloadsButton.addEventListener('click', this.clearAllDbItems.bind(this), false);
		this.downloadManagerClearDownloadsButton.innerText = i18n.__('sidebar.downloadManager.clear');
	}

	/**
	 * show download manager window with content
	 */
	async showWindow() {
		const downloadManagerWindow = document.querySelector('.app-download-manager');
		if (downloadManagerWindow.style.display === 'none') {
			// create elements
			const downloadData = await this.loadDownloads();
			downloadData.forEach((item) => {
				const downloadManagerItem = this.createDownloadManagerItem(item);
				this.downloadManagerItems.appendChild(downloadManagerItem);
			});

			downloadManagerWindow.style.display = 'block';
			this.downloadManagerWindowIsActive = true;
		} else {
			// delete elements
			downloadManagerWindow.style.display = 'none';
			this.downloadManagerItems.innerHTML = '';
			this.downloadManagerWindowIsActive = false;
		}
	}

	/**
	 * create download manager item with all div's and data
	 */
	createDownloadManagerItem(item) {
		const divElement = document.createElement('div');
		divElement.setAttribute('id', item.creationDate);
		divElement.setAttribute('class', 'app-download-manager-item');

		const titleDiv = document.createElement('div');
		titleDiv.textContent = item.fileName;
		titleDiv.setAttribute('class', 'app-download-manager-item_title');

		const downloadDiv = document.createElement('div');
		downloadDiv.textContent = `${ formatMemorySize(item.transferred) } of ${ formatMemorySize(item.total) }`;
		downloadDiv.setAttribute('class', 'app-download-manager-item_dl_state');

		const buttonsDiv = document.createElement('div');
		buttonsDiv.setAttribute('class', 'app-download-manager-item_buttons');

		const actionDiv = document.createElement('div');
		actionDiv.setAttribute('class', 'app-download-manager-item-button_action');
		actionDiv.textContent = '×';
		actionDiv.addEventListener('click', this.clearOneItem.bind(this), false);

		const showDiv = document.createElement('div');
		showDiv.setAttribute('class', 'app-download-manager-item-button_show');
		showDiv.setAttribute('path', item.filePath);
		showDiv.addEventListener('click', this.showFile.bind(this), false);

		const showDivIcon = document.createElement('div');
		showDivIcon.setAttribute('class', 'app-download-manager-item-button_show_icon');
		showDivIcon.textContent = '⚲';

		showDiv.appendChild(showDivIcon);
		buttonsDiv.appendChild(actionDiv);
		buttonsDiv.appendChild(showDiv);

		divElement.appendChild(titleDiv);
		divElement.appendChild(downloadDiv);
		divElement.appendChild(buttonsDiv);

		return divElement;
	}

	async loadDownloads() {
		return new Promise((resolve, reject) => {
			const store = this.getDownloadManagerStore('readonly');
			const result = store.getAll();
			result.onsuccess = () => {
				resolve(result.result, null);
			};
			result.onerror = (e) => {
				reject(null, e);
			};
		});
	}

	/**
	 * save item in database
	 */
	saveDbItem(item) {
		const store = this.getDownloadManagerStore('readwrite');
		const request = store.add(item);
		request.onerror = () => {
		};

		request.onsuccess = () => {
		};
	}

	/**
	 * update object in database
	 */
	updateDbItem(item) {
		const store = this.getDownloadManagerStore('readwrite');
		return store.put(item);
	}

	/**
	 * clear all not running downloads from databse
	 */
	clearAllDbItems() {
		const store = this.getDownloadManagerStore('readwrite');
		const request = store.getAll();
		request.onsuccess = () => {
			request.result.forEach((element) => {
				if (element.fileState !== 'progressing') {
					store.delete(element.creationDate);
					const childElement = document.getElementById(element.creationDate);
					this.downloadManagerItems.removeChild(childElement);
				}
			});
		};
	}

	async clearDbItem(id) {
		const store = this.getDownloadManagerStore('readwrite');
		return store.delete(Number(id));
	}

	async clearOneItem(event) {
		console.log(`clear one item ${ event.target.parentElement.parentElement.id }`);
		const { id } = event.target.parentElement.parentElement;
		if (id !== undefined) {
			const request = await this.clearDbItem(id);
			request.onsuccess = () => {
				// remove div from view if download manager was shown
				if (this.downloadManagerWindowIsActive) {
					const deletedDownloadItemDiv = document.getElementById(id);
					if (deletedDownloadItemDiv !== undefined) {
						this.downloadManagerItems.removeChild(deletedDownloadItemDiv);
					}
				}
			};
		}
	}

	async showFile(event) {
		const fileDownloadFilePath = event.target.parentElement.attributes.path.value;
		shell.showItemInFolder(fileDownloadFilePath);
	}

	getDownloadManagerStore(mode) {
		const transaction = this.db.transaction(['downloads'], mode);
		return transaction.objectStore('downloads');
	}

	/**
	 * download of item started, set downloadManagerButton to active
	 */
	async downloadStarted(downloadItem) {
		if (!this.downloadManagerButton.className.includes('active')) {
			this.downloadManagerButton.className = `${ this.downloadManagerButton.className } ${ this.downloadManagerButton.className }-active`;
		}

		// add item direct if downloadmanager is open
		if (this.downloadManagerWindowIsActive) {
			// add render method
			const downloadManagerItem = await this.createDownloadManagerItem(downloadItem);
			this.downloadManagerItems.appendChild(downloadManagerItem);
		}
		// save item to db
		this.saveDbItem(downloadItem);
	}

	downloadFinished(downloadItem) {
		const request = this.updateDbItem(downloadItem);
		request.onsuccess = () => {
			this.inactiveDownloadManagerButton(this.downloadManagerButton);
		};
		request.onerror = () => {
			// set item in list to error?
		};
	}

	/**
	 * check htmlElement an change class if no download is running
	 */
	async inactiveDownloadManagerButton(htmlElement) {
		if (htmlElement.className.includes('active')) {
			// check if any other
			const runningDownloads = await this.checkRunningDownloads();
			if (!runningDownloads) {
				htmlElement.className = `${ htmlElement.className.split(' ')[0] }`;
			}
		}
	}

	/**
	 * check if any download is still running.
	 */
	async checkRunningDownloads() {
		return new Promise((resolve, reject) => {
			const store = this.getDownloadManagerStore('readonly');
			const fileStateIndex = store.index('fileState');
			const request = fileStateIndex.get('progressing');
			request.onerror = (e) => {
				reject(null, e);
			};

			request.onsuccess = (e) => {
				if (e.target.result === undefined) {
					resolve(false, null);
				} else {
					resolve(true, null);
				}
			};
		});
	}

	downloadError() {
		this.inactiveDownloadManagerButton(this.downloadManagerButton);
	}

	downloadDataReceived(downloadItem) {
		if (this.downloadManagerWindowIsActive) {
			const element = document.getElementById(downloadItem.creationDate);
			element.childNodes[1].innerHTML = `${ formatMemorySize(downloadItem.transferred) } of ${ formatMemorySize(downloadItem.total) }`;
		}
	}
}

export const downloads = new DownloadManager();

function *didDownloadStart({ payload: download }) {
	downloads.downloadStarted(download);
}

function *didDownloadUpdate({ payload: download }) {
	if (download.state === 'progressing' && !download.paused) {
		downloads.downloadDataReceived(download);
		return;
	}

	if (download.state === 'completed') {
		downloads.downloadFinished(download);
		return;
	}

	if (download.state === 'interrupted' || download.state === 'cancelled') {
		downloads.downloadError(download);
		return;
	}
}

sagaMiddleware.run(function *watchDownloadsActions() {
	yield takeEvery(DOWNLOAD_STARTED, didDownloadStart);
	yield takeEvery(DOWNLOAD_UPDATED, didDownloadUpdate);
});
