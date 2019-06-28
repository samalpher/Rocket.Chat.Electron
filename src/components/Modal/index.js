import React from 'react';
import { useDialogRef } from './hooks';
import { ModalDialog } from './styles';


export function Modal({ open, ...props }) {
	const dialogRef = useDialogRef(open);

	return <ModalDialog ref={dialogRef} {...props} />;
}

export {
	ModalTitle,
	ModalActions,
} from './styles';
