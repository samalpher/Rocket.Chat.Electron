import { remote } from 'electron';
import { useMemo } from 'react';


const useMainWindow = () => useMemo(() => remote.getCurrentWindow(), []);

export default useMainWindow;
