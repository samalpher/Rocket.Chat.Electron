import { useEffect, useRef } from 'react';


export const useDialogRef = (open) => {
	const dialogRef = useRef(null);

	useEffect(() => {
		open ?
			(!dialogRef.current.open && dialogRef.current.showModal()) :
			(dialogRef.current.open && dialogRef.current.close());
	}, [open]);

	return dialogRef;
};
