import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { PopupMenu } from '../../../PopupMenu';
import { useContextMenuTemplate } from './hooks';


export const ContextMenu = forwardRef(
	function ContextMenu(props, ref) {
		const [open, setOpen] = useState(false);
		const [template, setTemplate] = useState([]);

		const handleClosing = () => setOpen(false);

		const createTemplate = useContextMenuTemplate();

		const trigger = async (params) => {
			const template = await createTemplate(params);
			setTemplate(template);
			setOpen(true);
		};

		useImperativeHandle(ref, () => ({ trigger }), []);

		return <PopupMenu template={template} open={open} onClosing={handleClosing} />;
	}
);

ContextMenu.displayName = 'ContextMenu';
