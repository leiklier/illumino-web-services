import {
	LOGIN,
	REFRESH_TOKEN,
	LOGOUT,
	SET_SELECTED_SECRET,
	CLEAR_SELECTED_SECRET,
	ADD_RECENT_SECRET,
	REMOVE_RECENT_SECRET,
} from './action-types'

export const setAccessToken = accessToken => {
	return {
		type: REFRESH_TOKEN,
		payload: { accessToken },
	}
}

export const clearAccessToken = () => {
	return { type: LOGOUT }
}

export const setSelectedSecret = secret => {
	return {
		type: SET_SELECTED_SECRET,
		payload: { secret },
	}
}

export const clearSelectedSecret = () => {
	return { type: CLEAR_SELECTED_SECRET }
}

export const addRecentSecret = secret => {
	return { type: ADD_RECENT_SECRET, payload: { secret } }
}

export const removeRecentSecret = secret => {
	return { type: REMOVE_RECENT_SECRET, payload: { secret } }
}
