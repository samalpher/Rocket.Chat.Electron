import { useMemo } from 'react';
import { useFocusedWebContents } from './focusedWebContents';


export const useTextEditActions = () => {
	const focusedWebContents = useFocusedWebContents();

	const undo = () => {
		focusedWebContents.undo();
	};

	const redo = () => {
		focusedWebContents.redo();
	};

	const cut = () => {
		focusedWebContents.cut();
	};

	const copy = () => {
		focusedWebContents.copy();
	};

	const paste = () => {
		focusedWebContents.paste();
	};

	const selectAll = () => {
		focusedWebContents.selectAll();
	};

	return useMemo(() => ({
		undo,
		redo,
		cut,
		copy,
		paste,
		selectAll,
	}), [focusedWebContents]);
};
