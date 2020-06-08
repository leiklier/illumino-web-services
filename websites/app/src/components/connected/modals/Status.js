import React, { useEffect, useMemo } from 'react'
import classNames from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import {
	setContentBlur,
	clearContentBlur,
	setStatusModalState,
} from '../../../store/actions'

import {
	FaSpinner,
	FaLockOpen,
	FaTimesCircle,
} from 'react-icons/fa'

import styles from './Status.css'

const LOGIN_IN_PROGRESS_TEXT = 'Unlocking device...'
const LOGIN_WRONG_PIN_TEXT = 'Wrong pin was entered.'
const LOGIN_SUCCEEDED_TEXT = 'Device unlocked'
const LOADING_TEXT = 'Loading...'

const StatusModal = () => {
	const dispatch = useDispatch()

	const state = useSelector(state => state.ui.statusModal.state)

	// Blur when not idle
	useEffect(() => {
		if (state !== 'IDLE') {
			dispatch(setContentBlur())
		} else {
			dispatch(clearContentBlur())
		}
	}, [state])

	// Set icon & text based on state
	const { text, Icon } = useMemo(() => {
		switch (state) {
			case 'LOGIN_IN_PROGRESS': {
				return {
					text: LOGIN_IN_PROGRESS_TEXT,
					Icon: FaSpinner,
				}
			}
			case 'LOGIN_WRONG_PIN': {
				return {
					text: LOGIN_WRONG_PIN_TEXT,
					Icon: FaTimesCircle
				}
			}
			case 'LOGIN_SUCCEEDED': {
				return {
					text: LOGIN_SUCCEEDED_TEXT,
					Icon: FaLockOpen,
				}
			}
			case 'LOADING': {
				return {
					text: LOADING_TEXT,
					Icon: FaSpinner
				}
			}
			default: {
				return {
					text: LOGIN_IN_PROGRESS_TEXT,
					Icon: FaSpinner
				}
			}
		}
	}, [state])

	// LOGIN_WRONG_PIN & LOGIN_SUCCEEDED should be shown for 1.5s:
	useEffect(() => {
		if (state === 'LOGIN_WRONG_PIN' || state === 'LOGIN_SUCCEEDED') {
			const timeout = window.setTimeout(() => {
				if (state === 'LOGIN_WRONG_PIN' || state === 'LOGIN_SUCCEEDED')
					dispatch(setStatusModalState('IDLE'))
			}, 1500)

			return () => window.clearTimeout(timeout)
		}
	}, [state])

	return (
		<div
			className={classNames({
				[styles.container]: true,
				[styles.containerIfIdle]: state === 'IDLE',
			})}
		>
			<Icon
				size={96}
				className={classNames({
					[styles.icon__spin]: Icon === FaSpinner,
				})}
			/>
			<div className={styles.text}>{text}</div>
		</div>
	)
}

export default StatusModal
