import { remote } from 'electron';
import { useMemo } from 'react';


export const useMenu = (template) => useMemo(() => remote.Menu.buildFromTemplate(template), [template]);
