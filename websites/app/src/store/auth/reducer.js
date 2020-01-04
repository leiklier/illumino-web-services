import {
	LOGIN,
	REFRESH_TOKEN,
	LOGOUT,
	SET_SELECTED_SECRET,
	CLEAR_SELECTED_SECRET,
	ADD_RECENT_SECRET,
	REMOVE_RECENT_SECRET,
} from './action-types'

export default function reducer(
	state = {
		accessToken: null,
		selectedSecret: null,
		recentSecrets: [],
	},
	action,
) {
	const { type, payload } = action
	switch (type) {
		case LOGIN: {
			return {
				...state,
				accessToken: payload.accessToken,
			}
		}
		case REFRESH_TOKEN: {
			return {
				...state,
				accessToken: payload.accessToken,
			}
		}
		case LOGOUT: {
			return {
				...state,
				accessToken: null,
			}
		}

		case SET_SELECTED_SECRET: {
			return {
				...state,
				selectedSecret: payload.secret,
			}
		}

		case CLEAR_SELECTED_SECRET: {
			return {
				...state,
				selectedSecret: null,
			}
		}

		case ADD_RECENT_SECRET: {
			if (state.recentSecrets.includes(payload.secret)) return state
			return {
				...state,
				recentSecrets: [...state.recentSecrets, payload.secret],
			}
		}

		case REMOVE_RECENT_SECRET: {
			return {
				...state,
				recentSecrets: state.recentSecrets.filter(
					secret => secret !== payload.secret,
				),
			}
		}

		default:
			return state
	}
}
