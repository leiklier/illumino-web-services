import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import {
	setContentBlur,
	clearContentBlur,
	setStatusModalState,
} from '../../store/actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faSpinner,
	faLockOpen,
	faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'

import styles from './Status.css'

const LOGIN_IN_PROGRESS_TEXT = 'Unlocking device...'
const LOGIN_WRONG_PIN_TEXT = 'Wrong pin was entered.'
const LOGIN_SUCCEEDED_TEXT = 'Device unlocked'
const LOADING_TEXT = 'Loading...'

const StatusModal = () => {
	const dispatch = useDispatch()

	const state = useSelector(state => state.ui.statusModal.state)

	const [icon, setIcon] = useState(faSpinner)
	const [text, setText] = useState(LOGIN_IN_PROGRESS_TEXT)

	// Blur when not idle
	useEffect(() => {
		if (state !== 'IDLE') {
			dispatch(setContentBlur())
		} else {
			dispatch(clearContentBlur())
		}
	}, [state])

	// Set icon & text based on state
	useEffect(() => {
		switch (state) {
			case 'LOGIN_IN_PROGRESS': {
				setIcon(faSpinner)
				setText(LOGIN_IN_PROGRESS_TEXT)
				break
			}
			case 'LOGIN_WRONG_PIN': {
				setIcon(faTimesCircle)
				setText(LOGIN_WRONG_PIN_TEXT)
				break
			}
			case 'LOGIN_SUCCEEDED': {
				setIcon(faLockOpen)
				setText(LOGIN_SUCCEEDED_TEXT)
				break
			}
			case 'LOADING': {
				setIcon(faSpinner)
				setText(LOADING_TEXT)
				break
			}
		}
	}, [state])

	// LOGIN_WRONG_PIN & LOGIN_SUCCEEDED should be shown for 1.5s:
	useEffect(() => {
		if (state === 'LOGIN_WRONG_PIN' || state === 'LOGIN_SUCCEEDED') {
			setTimeout(() => {
				if (state === 'LOGIN_WRONG_PIN' || state === 'LOGIN_SUCCEEDED')
					dispatch(setStatusModalState('IDLE'))
			}, 1500)
		}
	}, [state])

	return (
		<div
			className={classNames({
				[styles.container]: true,
				[styles.containerIfIdle]: state === 'IDLE',
			})}
		>
			<FontAwesomeIcon icon={icon} size="6x" spin={icon === faSpinner} />
			<div className={styles.text}>{text}</div>
		</div>
	)
}

export default StatusModal
