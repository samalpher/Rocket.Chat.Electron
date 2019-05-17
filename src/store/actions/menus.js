export const MENU_ITEM_CLICKED = 'MENU_ITEM_CLICKED';


export const menuItemClicked = (action, ...args) => ({
	type: MENU_ITEM_CLICKED,
	payload: { action, args },
});
