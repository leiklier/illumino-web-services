import React, { useState, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import {
	setAccessToken,
	setStatusModalState,
	clearSelectedSecret,
} from '../store/actions'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { FaChevronCircleLeft } from 'react-icons/fa'

import PinInput from '../components/pure/inputs/Pin'
import * as Semantic from '../components/pure/layouts/Semantic'
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
		<Semantic.Layout style={{ width: '100%', height: '100%' }}>
			<Semantic.Header>
				<h2 className={styles.h2}>Unlock</h2>
				<h1 className={styles.h1}>{deviceName}</h1>
			</Semantic.Header>

			<Semantic.Main>
				<PinInput pinLength={6} onInput={setPin} />
			</Semantic.Main>

			<Semantic.Footer>
				<GoBackButton
					onClick={() => {
						setPin('')
						dispatch(clearSelectedSecret())
					}}
				/>
			</Semantic.Footer>
		</Semantic.Layout>
	)
}

function GoBackButton({ onClick }) {
	return (
		<div className={styles.clearSecretButton} onClick={onClick}>
			<FaChevronCircleLeft size={32} />
			<div className={styles.clearSecretButtonText}>Choose another device</div>
		</div>
	)
}

export default UnlockDeviceView
