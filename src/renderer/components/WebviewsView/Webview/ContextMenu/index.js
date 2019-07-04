import { forwardRef } from 'react';
import { useContextMenuTrigger } from './hooks';


export const ContextMenu = forwardRef(function ContextMenu(props, ref) {
	useContextMenuTrigger(ref);

	return null;
});
