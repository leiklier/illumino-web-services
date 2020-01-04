import {
	SET_BACKGROUND_COLOR,
	SET_CONTENT_BLUR,
	CLEAR_CONTENT_BLUR,
	SET_STATUS_MODAL_STATE,
} from './action-types'

export const setBackgroundColor = (red, green, blue) => {
	return {
		type: SET_BACKGROUND_COLOR,
		payload: { red, green, blue },
	}
}

export const setContentBlur = () => {
	return { type: SET_CONTENT_BLUR }
}

export const clearContentBlur = () => {
	return { type: CLEAR_CONTENT_BLUR }
}

export const setStatusModalState = state => {
	return {
		type: SET_STATUS_MODAL_STATE,
		payload: { state },
	}
}
