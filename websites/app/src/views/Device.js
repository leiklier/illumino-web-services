import React, { useState, useEffect } from 'react'

import gql from 'graphql-tag'
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useDispatch } from 'react-redux'
import {
	setStatusModalState,
	clearSelectedSecret,
	clearAccessToken,
} from '../store/actions'

import { faChartBar } from '@fortawesome/free-solid-svg-icons'

import DeviceTitle from '../components/DeviceTitle'
import CircularButton from '../components/inputs/pure/CircularButton'
import CycleButton from '../components/inputs/pure/CycleButton'

import ConnectedSunriseInput from '../components/inputs/connected/Sunrise'
import ConnectedSunsetInput from '../components/inputs/connected/Sunset'

import ConnectedBrightnessInput from '../components/inputs/connected/Brightness'
import ConnectedColorInput from '../components/inputs/connected/Color'
import ConnectedAnimationSpeedInput from '../components/inputs/connected/AnimationSpeed'
import ConnectedAnimationTypeInput from '../components/inputs/connected/AnimationType'

const LOGOUT = gql`
	query logout {
		logout
	}
`

const DEVICE_QUERY = gql`
	query getDevice {
		device {
			mac
			name
			ledStrips {
				id
			}
			ledStripsAreSynced
		}
	}
`

const DEVICE_SUBSCRIPTION = gql`
	subscription onDeviceUpdated {
		device {
			mac
			name
			ledStrips {
				id
			}
			ledStripsAreSynced
		}
	}
`


const SET_LEDSTRIPS_ARE_SYNCED = gql`
	mutation setLedStripsAreSynced($mac: String!, $masterLedStripId: ID!) {
		setLedStripsAreSynced(mac: $mac, masterLedStripId: $masterLedStripId) {
			ledStripsAreSynced
		}
	}
`

const CLEAR_LEDSTRIPS_ARE_SYNCED = gql`
	mutation clearLedStripsAreSynced($mac: String!) {
		clearLedStripsAreSynced(mac: $mac) {
			ledStripsAreSynced
		}
	}
`

const Device = () => {
	const dispatch = useDispatch()

	const { subscribeToMore, loading: isLoading, data } = useQuery(DEVICE_QUERY)

	const [handleLogout] = useLazyQuery(LOGOUT, {
		onCompleted: () => {
			// Remove accessToken after
			// removing refreshToken in order
			// to avoid race around condition:
			dispatch(clearSelectedSecret())
			dispatch(clearAccessToken())
		}
	})

	const [setLedStripsAreSynced] = useMutation(SET_LEDSTRIPS_ARE_SYNCED)
	const [clearLedStripsAreSynced] = useMutation(CLEAR_LEDSTRIPS_ARE_SYNCED)

	const [selectedLedStrip, setSelectedLedStrip] = useState(1)

	// Receive realtime updates for device:
	useEffect(() => {
		subscribeToMore({
			document: DEVICE_SUBSCRIPTION,
			updateQuery: (prev, { subscriptionData }) => {
				if (!subscriptionData.data) return prev
				const updatedDevice = subscriptionData.data.device

				return Object.assign({}, prev, { device: updatedDevice })
			},
		})
	}, [])

	// Reset loading indicator on unmount
	useEffect(() => () => dispatch(setStatusModalState('IDLE')), [])

	// Show loading indicator
	useEffect(() => {
		if (isLoading) dispatch(setStatusModalState('LOADING'))
		else dispatch(setStatusModalState('IDLE'))
	}, [isLoading])

	// Input handlers
	function handleSelectAllLedStrips(allAreSelected) {
		if (allAreSelected) {
			setLedStripsAreSynced({
				variables: {
					mac: data.device.mac,
					masterLedStripId: data.device.ledStrips[selectedLedStrip - 1].id,
				},
			})
		} else {
			clearLedStripsAreSynced({ variables: { mac: data.device.mac } })
		}
	}

	if (isLoading) {
		return <></>
	}

	return (
		<>
			<DeviceTitle onLogout={handleLogout}>
				{data.device.name ? data.device.name : data.device.mac}
			</DeviceTitle>
			<ConnectedAnimationTypeInput
				cols={3}
				mac={data.device.mac}
				ledStripIndex={selectedLedStrip - 1}
			/>
			<ConnectedBrightnessInput
				rows={3}
				cols={1}
				mac={data.device.mac}
				ledStripIndex={selectedLedStrip - 1}
			/>
			<ConnectedAnimationSpeedInput
				rows={1}
				cols={3}
				mac={data.device.mac}
				ledStripIndex={selectedLedStrip - 1}
			/>
			<ConnectedSunriseInput mac={data.device.mac} />
			<CircularButton icon={faChartBar} iconColor="rgb(50, 92, 168)" />
			<CycleButton
				selected={selectedLedStrip}
				allAreSelected={data.device.ledStripsAreSynced}
				onSelectAll={handleSelectAllLedStrips}
				options={data.device.ledStrips.map((ledStrip, i) => i + 1)}
				onSelect={value => setSelectedLedStrip(value)}
			>
				Ledstrip
			</CycleButton>
			<ConnectedColorInput
				mac={data.device.mac}
				ledStripIndex={selectedLedStrip - 1}
				syncWithAppBackground
			/>
			<ConnectedSunsetInput mac={data.device.mac} />
		</>
	)
}


export default Device
