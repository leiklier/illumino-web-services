import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import gql from 'graphql-tag'

import { useDispatch, useSelector } from 'react-redux'
import { useLazyQuery } from '@apollo/react-hooks'

import jwt from 'jsonwebtoken'

import {
	setAccessToken,
	addRecentSecret,
	setSelectedSecret,
} from './store/actions'

import SelectDeviceView from './views/SelectDevice'
import UnlockDeviceView from './views/UnlockDevice'
import DeviceView from './views/Device'

import StatusModal from './components/modals/Status'

import styles from './App.css'

const HAS_REFRESH_TOKEN = gql`
	query hasRefreshToken {
		hasRefreshToken
	}
`

const GET_ACCESS_TOKEN = gql`
	query accessToken {
		accessToken {
			accessToken
		}
	}
`

const SECRET_IS_VALID = gql`
	query secretIsValid($secret: String!) {
		secretIsValid(secret: $secret)
	}
`

const App = props => {
	// prettier-ignore
	const { match: { params }} = props

	const dispatch = useDispatch()
	const history = useHistory()

	const secretIsSelected = useSelector(state => state.auth.selectedSecret)
	const accessToken = useSelector(state => state.auth.accessToken)

	const contentIsBlurred = useSelector(state => state.ui.content.isBlurred)
	const bgColor = useSelector(state => state.ui.background.color)
	const [currentView, setCurrentView] = useState(<SelectDeviceView />)

	// Redirect to login if secret is received in URL
	useEffect(() => {
		if (!params.secret) return
		checkSecret()
	}, [])

	// Login if not having accessToken
	useEffect(() => {
		if (accessToken) return
		login()
	}, [])

	// Get accessToken if having refreshToken
	const [login] = useLazyQuery(HAS_REFRESH_TOKEN, {
		onCompleted: function(data) {
			if (!data || !data.hasRefreshToken) return
			getAccessToken()
		},
	})

	const [getAccessToken] = useLazyQuery(GET_ACCESS_TOKEN, {
		onCompleted: function(data) {
			dispatch(setAccessToken(data.accessToken.accessToken))
		},
	})

	const [checkSecret] = useLazyQuery(SECRET_IS_VALID, {
		variables: { secret: params.secret },
		onCompleted: function(data) {
			if (!data || !data.secretIsValid) return

			dispatch(addRecentSecret(params.secret))
			dispatch(setSelectedSecret(params.secret))
			history.replace('/')
		},
	})

	// Renew accessToken before expiration
	useEffect(() => {
		if (accessToken) {
			const { exp: expiresAt } = jwt.decode(accessToken)
			setTimeout(
				() => getAccessToken(),
				expiresAt * 1000 - Date.now() - 5 * 60 * 1000,
			)
		}
	}, [accessToken])

	// Render correct view
	useEffect(() => {
		if (accessToken) {
			setCurrentView(<DeviceView />)
		} else if (secretIsSelected) {
			setCurrentView(<UnlockDeviceView />)
		} else {
			setCurrentView(<SelectDeviceView />)
		}
	}, [accessToken, secretIsSelected])

	return (
		<>
			<StatusModal />
			<div
				className={styles.content}
				style={{
					background: `rgb(${bgColor.red}, ${bgColor.green}, ${bgColor.blue})`,
					filter: contentIsBlurred ? 'blur(0.25rem)' : 'none',
				}}
			>
				<div className={styles.contentWrapper}>{currentView}</div>
			</div>
		</>
	)
}

export default App
