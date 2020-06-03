import React, { useState, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import {
	setAccessToken,
	setStatusModalState,
	clearSelectedSecret,
} from '../store/actions'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons'

import Logo from '../components/Logo'
import PinInput from '../components/inputs/pure/Pin'
import styles from './UnlockDevice.css'

const GET_DEVICE = gql`
	query getDevice($secret: String!) {
		device(secret: $secret) {
			id
			mac
			name
			hasPin
		}
	}
`

const LOGIN_DEVICE = gql`
	query loginDevice($secret: String!, $pin: PIN) {
		loginDevice(secret: $secret, pin: $pin) {
			accessToken
			deviceId
		}
	}
`

const UnlockDeviceView = props => {
	const dispatch = useDispatch()
	const secret = useSelector(state => state.auth.selectedSecret)

	const [deviceName, setDeviceName] = useState('Illuminode')
	const [pin, setPin] = useState('')

	const { data: deviceData } = useQuery(GET_DEVICE, {
		variables: { secret },
	})

	const [
		doLogin,
		{ loading: loginIsLoading, error: loginError, data: loginData },
	] = useLazyQuery(LOGIN_DEVICE, {
		variables: { pin, secret },
	})

	// Reset loading indicator on unmount
	useEffect(() => () => dispatch(setStatusModalState('IDLE')), [])

	// Control status indicator
	useEffect(() => {
		if (secret && loginIsLoading)
			dispatch(setStatusModalState('LOGIN_IN_PROGRESS'))
	}, [loginIsLoading])

	useEffect(() => {
		if (secret && loginError) dispatch(setStatusModalState('LOGIN_WRONG_PIN'))
	}, [loginError])

	useEffect(() => {
		if (loginData) {
			dispatch(setStatusModalState('LOGIN_SUCCEEDED'))
			dispatch(setAccessToken(loginData.loginDevice.accessToken))
		}
	}, [loginData])

	// Fetch deviceName
	useEffect(() => {
		if (deviceData && deviceData.device) {
			setDeviceName(
				deviceData.device.name ? deviceData.device.name : deviceData.device.mac,
			)
		}
	}, [deviceData])

	// Perform login
	useEffect(() => {
		if (pin.length) doLogin()
	}, [pin])

	return (
		<>
			<div className={styles.headerContainer}>
				<h2 className={styles.subHeader}>Unlock</h2>
				<h1 className={styles.header}>{deviceName}</h1>
			</div>
			<PinInput pinLength={6} onInput={setPin} />
			<ClearSecretButton
				onClick={() => {
					setPin('')
					dispatch(clearSelectedSecret())
				}}
			/>
		</>
	)
}

function ClearSecretButton({ onClick }) {
	return (
		<div className={styles.clearSecretButton} onClick={onClick}>
			<FontAwesomeIcon icon={faChevronCircleLeft} size="2x" />
			<div className={styles.clearSecretButtonText}>Choose another device</div>
		</div>
	)
}

export default UnlockDeviceView
