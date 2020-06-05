import React, { useState, useEffect } from 'react'

import gql from 'graphql-tag'
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useDispatch } from 'react-redux'
import {
	setStatusModalState,
	clearSelectedSecret,
	clearAccessToken,
	setBackgroundColor,
} from '../store/actions'

import { faChartBar } from '@fortawesome/free-solid-svg-icons'

import DeviceTitle from '../components/DeviceTitle'
import SelectInput from '../components/inputs/pure/Select'
import CircularButton from '../components/inputs/pure/CircularButton'
import CycleButton from '../components/inputs/pure/CycleButton'
import ColorPicker from '../components/inputs/pure/ColorPicker'
import ConnectedBrightnessInput from '../components/inputs/connected/Brightness'
import ConnectedSunriseInput from '../components/inputs/connected/Sunrise'
import ConnectedSunsetInput from '../components/inputs/connected/Sunset'

import withDebounce from '../HOCs/with-debounce'
import ConnectedAnimationSpeedInput from '../components/inputs/connected/AnimationSpeed'

// Debounced inputs:
const DebouncedColorPicker = withDebounce(ColorPicker)

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
				color {
					red
					green
					blue
				}
				animation {
					type
				}
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
				color {
					red
					green
					blue
				}
				animation {
					type
				}
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

	const [logout] = useLazyQuery(LOGOUT)

	const [setLedStripsAreSynced] = useMutation(SET_LEDSTRIPS_ARE_SYNCED)
	const [clearLedStripsAreSynced] = useMutation(CLEAR_LEDSTRIPS_ARE_SYNCED)

	const [selectedLedStrip, setSelectedLedStrip] = useState(1)

	// TEMP START ---
	const [color, setColor] = useState({ saturation: 0, hue: 0 })
	// TEMP END ---

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

	function handleLogout() {
		dispatch(clearSelectedSecret())
		dispatch(clearAccessToken())
		logout()
	}

	if (isLoading) {
		return <></>
	}

	return (
		<>
			<DeviceTitle onLogout={handleLogout}>
				{data.device.name ? data.device.name : data.device.mac}
			</DeviceTitle>
			<SelectInput
				cols={3}
				name="animation"
				selected="MANUAL"
				options={['MANUAL', 'FIREPLACE', 'VIVID', 'SPECTRUM', 'STARS']}
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
			<DebouncedColorPicker
				value={color}
				debouncedOnInput={setColor}
				onInput={value => {
					if (typeof value !== 'object' || value === null) return
					const { red, green, blue } = hsvToRgb(value.hue, value.saturation, 0.8)
					dispatch(setBackgroundColor(red, green, blue))
				}}
			/>
			<ConnectedSunsetInput mac={data.device.mac} />
		</>
	)
}

function hsvToRgb(hue, saturation, value) {
	// Using formula as found on
	// https://www.rapidtables.com/convert/color/hsv-to-rgb.html

	// Expects:
	// 0 <= hue <= 360
	// 0 <= saturation <= 1
	// 0 <= value <= 1

	const C = value * saturation
	const X = C * (1 - Math.abs((hue / 60) % 2 - 1))
	const m = value - C

	let R_, G_, B_
	if (hue < 60) {
		[R_, G_, B_] = [C, X, 0]
	} else if (hue < 120) {
		[R_, G_, B_] = [X, C, 0]
	} else if (hue < 180) {
		[R_, G_, B_] = [0, C, X]
	} else if (hue < 240) {
		[R_, G_, B_] = [0, X, C]
	} else if (hue < 300) {
		[R_, G_, B_] = [X, 0, C]
	} else {
		[R_, G_, B_] = [C, 0, X]
	}

	return {
		red: (R_ + m) * 255,
		green: (G_ + m) * 255,
		blue: (B_ + m) * 255,
	}
}

export default Device
