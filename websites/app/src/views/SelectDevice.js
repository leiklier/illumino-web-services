import React, { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import {
	addRecentSecret,
	removeRecentSecret,
	setSelectedSecret,
} from '../store/actions'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import Logo from '../components/pure/Logo'
import StringInput from '../components/pure/inputs/String'
import RemovableButton from '../components/pure/inputs/RemovableButton'

import styles from './SelectDevice.css'

const GET_DEVICE = gql`
	query getDevice($secret: String!) {
		device(secret: $secret) {
			id
			mac
			name
		}
	}
`

const SECRET_IS_VALID = gql`
	query secretIsValid($secret: String!) {
		secretIsValid(secret: $secret)
	}
`

const SelectDeviceView = () => {
	const recentSecrets = useSelector(state => state.auth.recentSecrets)
	const dispatch = useDispatch()
	const [secret, setSecret] = useState('')

	const [checkSecret] = useLazyQuery(SECRET_IS_VALID, {
		variables: { secret },
		onCompleted: function (data) {
			if (!data || !data.secretIsValid) return

			dispatch(addRecentSecret(secret))
			dispatch(setSelectedSecret(secret))
		},
	})

	useEffect(() => {
		checkSecret()
	}, [secret])

	return (
		<>
			<h1 className={styles.header}>Unlock device</h1>
			<h2 className={styles.subHeader}>Add new:</h2>
			<StringInput
				placeholder="Type secret..."
				value={secret}
				onChange={setSecret}
			/>
			{recentSecrets.length ? (
				<h2 className={styles.subHeader}>Recently used:</h2>
			) : (
					''
				)}
			{recentSecrets.map(secret => (
				<DeviceButton
					key={secret}
					secret={secret}
					onClick={() => dispatch(setSelectedSecret(secret))}
					onDelete={() => dispatch(removeRecentSecret(secret))}
				/>
			))}
			<Logo className={styles.logo} color="white" />
		</>
	)
}

function DeviceButton({ secret, onClick, onDelete }) {
	const { data } = useQuery(GET_DEVICE, {
		variables: { secret },
	})
	return (
		<RemovableButton onClick={onClick} onDelete={onDelete}>
			{data && data.device.name ? data.device.name : 'Loading...'}
		</RemovableButton>
	)
}

export default SelectDeviceView
