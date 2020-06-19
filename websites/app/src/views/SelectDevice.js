import React, { useState, useEffect, useMemo } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import {
	addRecentSecret,
	setSelectedSecret,
} from '../store/actions'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import Logo from '../components/pure/Logo'
import TextInput from '../components/pure/inputs/Text'

import { IoMdInformationCircle } from 'react-icons/io'
import { MdError } from 'react-icons/md'
import * as Semantic from '../components/pure/layouts/Semantic'
import styles from './SelectDevice.css'

const GET_DEVICE = gql`
	query getDevice($secret: String!) {
		device(secret: $secret) {
			id
			secret
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

	const [formattedSecret, setFormattedSecret] = useState('')
	const secret = useMemo(() => {
		return formattedSecret.split("-").join("").toLowerCase()
	}, [formattedSecret])

	const [secretIsInvalid, setSecretIsInvalid] = useState(false)

	const [checkSecret, {data}] = useLazyQuery(SECRET_IS_VALID, {
		variables: { secret },
	})

	useEffect(() => {
		if(!data) return
		if(data.secretIsValid) {
			// This redirects user to views/UnlockDevice
			dispatch(addRecentSecret(secret))
			dispatch(setSelectedSecret(secret))
		}
	}, [data])

	useEffect(() => {
		if(secret.length < 12) return
		checkSecret()
	}, [secret])

	useEffect(() => {
		if(secret.length < 12) {
			setSecretIsInvalid(false)
		} else if(data && !data.secretIsInvalid) {
			setSecretIsInvalid(true)
		}
	}, [secret, data])

	function handleSecretInput(newSecret) {
		const strippedSecret = newSecret
			.split("-").join("")
			.toUpperCase()
			.replace(/[^0-9a-z]/gi, '')
		
		if(strippedSecret.length === 0) {
			setFormattedSecret('')
			return
		}

		setFormattedSecret(
			strippedSecret
				.match(/.{1,4}/g)
				.join("-")
		)
	}

	return (
		<Semantic.Layout style={{ width: '100%', height: '100%'}}>
			<Semantic.Header>
				<h1>Unlock device</h1>
			</Semantic.Header>

			<Semantic.Main>

				<h2>Add new:</h2>
				<div className={styles.block}>
					<TextInput
						label="Device-ID"
						maxLength={12 + 2} // To account for the dashes
						value={formattedSecret}
						onInput={handleSecretInput}
					/>
				</div>
				<div className={styles.inputExplanation}>
					<div>
						<IoMdInformationCircle />
						Where to find
					</div>
					{ secretIsInvalid ?
						<div className={styles.inputError}>
							<MdError /> Invalid
						</div> :
						<div className={styles.inputProgress}>
							{secret.length}/12
						</div>
					}
				</div>
				
				{recentSecrets.length ? (
					<h2>Recently used:</h2>
				) : (
						''
					)}
				{recentSecrets.map(secret => (
					<DeviceButton
						key={secret}
						secret={secret}
						onClick={() => dispatch(setSelectedSecret(secret))}
					/>
				))}
			</Semantic.Main>
			
			<Semantic.Footer>
				<Logo className={styles.logo} color="white" />
			</Semantic.Footer>
		</Semantic.Layout>
	)
}

function DeviceButton({ secret, onClick, onDelete }) {
	const { data } = useQuery(GET_DEVICE, {
		variables: { secret },
	})
	const text = useMemo(() => {
		const dataIsFetched = data && data.device
		if(!dataIsFetched) return 'Loading...'
		return data.device.name || 'New IllumiNode'
	}, [data])
	return (
		<div className={styles.block} onClick={onClick}>
			<div className={styles.deviceButton}>
				{text}
			</div>
		</div>
	)
}

export default SelectDeviceView
