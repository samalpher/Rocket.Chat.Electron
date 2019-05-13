import { remote, webFrame } from 'electron';
const { spellchecking } = remote.require('./main');


export default () => {
	webFrame.setSpellCheckProvider('', { spellCheck: spellchecking.check });
};
