import { SET_EDIT_FLAGS } from '../actions';


const filterFlags = ({
	canUndo = false,
	canRedo = false,
	canCut = false,
	canCopy = false,
	canPaste = false,
	canSelectAll = false,
}) => ({
	canUndo,
	canRedo,
	canCut,
	canCopy,
	canPaste,
	canSelectAll,
});

export const reducer = (state = filterFlags({}), { type, payload }) => {
	switch (type) {
		case SET_EDIT_FLAGS: {
			return filterFlags({ ...state, ...payload });
		}
	}

	return state;
};
