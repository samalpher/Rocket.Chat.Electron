import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { PopupMenu } from '../../../PopupMenu';
import { useContextMenuTemplate } from './hooks';


export const ContextMenu = forwardRef(
	function ContextMenu(props, ref) {
		const [open, setOpen] = useState(false);
		const [template, setTemplate] = useState([]);

		const handleClosing = useCallback(() => {
			setOpen(false);
		}, [setOpen]);

		const createTemplate = useContextMenuTemplate();

		useImperativeHandle(ref, () => ({
			trigger: async (params) => {
				const template = await createTemplate(params);
				setTemplate(template);
				setOpen(true);
			},
		}), [setTemplate, setOpen]);

		return <PopupMenu template={template} open={open} onClosing={handleClosing} />;
	}
);

ContextMenu.displayName = 'ContextMenu';
