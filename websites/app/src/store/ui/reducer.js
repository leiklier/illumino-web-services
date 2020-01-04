import {
	SET_BACKGROUND_COLOR,
	SET_CONTENT_BLUR,
	CLEAR_CONTENT_BLUR,
	SET_STATUS_MODAL_STATE,
} from './action-types'

export default function reducer(
	state = {
		background: {
			color: { red: 60, green: 92, blue: 115 },
		},
		content: {
			isBlurred: false,
		},
		statusModal: {
			state: 'IDLE',
		},
	},
	action,
) {
	const { type, payload } = action
	switch (type) {
		case SET_BACKGROUND_COLOR: {
			return {
				...state,
				background: {
					...state.background,
					color: payload,
				},
			}
		}
		case SET_CONTENT_BLUR: {
			return {
				...state,
				content: {
					...state.content,
					isBlurred: true,
				},
			}
		}
		case CLEAR_CONTENT_BLUR: {
			return {
				...state,
				content: {
					...state.content,
					isBlurred: false,
				},
			}
		}
		case SET_STATUS_MODAL_STATE: {
			return {
				...state,
				statusModal: {
					...state.statusModal,
					state: payload.state,
				},
			}
		}

		default:
			return state
	}
}
