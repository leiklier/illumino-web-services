import React, { useState, useEffect } from 'react'

import gql from 'graphql-tag'
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useDispatch } from 'react-redux'
import {
	setStatusModalState,
	clearSelectedSecret,
	clearAccessToken,
} from '../store/actions'

import { faSun, faRunning, faChartBar } from '@fortawesome/free-solid-svg-icons'

import DeviceTitle from '../components/DeviceTitle'
import SelectInput from '../components/inputs/Select'
import RangeInput from '../components/inputs/Range'
import SunriseInput from '../components/inputs/SunRise'
import SunsetInput from '../components/inputs/Sunset'
import CircularButton from '../components/inputs/CircularButton'
import CycleButton from '../components/inputs/CycleButton'
import ColorPicker from '../components/inputs/ColorPicker'

import withDebounce from '../HOCs/with-debounce'

// Debounced inputs:
const DebouncedSunriseInput = withDebounce(SunriseInput)
const DebouncedRangeInput = withDebounce(RangeInput)

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
				name
				brightness
				color {
					red
					green
					blue
				}
				animation {
					type
					speed
				}
			}
			ledStripsAreSynced
			sunset {
				startedAt
				endingAt
			}
			sunrise {
				isActive
				startingAt {
					hour
					minute
				}
			}
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
				name
				brightness
				color {
					red
					green
					blue
				}
				animation {
					type
					speed
				}
			}
			ledStripsAreSynced
			sunset {
				startedAt
				endingAt
			}
			sunrise {
				isActive
				startingAt {
					hour
					minute
				}
			}
		}
	}
`

const SET_BRIGHTNESS = gql`
	mutation setBrightness($mac: String!, $ledStripId: ID!, $brightness: Float!) {
		setBrightnessOnLedStrip(
			mac: $mac
			ledStripId: $ledStripId
			brightness: $brightness
		) {
			brightness
		}
	}
`

const SET_ANIMATION_SPEED = gql`
	mutation setAnimationSpeed(
		$mac: String!
		$ledStripId: ID!
		$animationSpeed: Float!
	) {
		setAnimationSpeedOnLedStrip(
			mac: $mac
			ledStripId: $ledStripId
			animationSpeed: $animationSpeed
		) {
			animation {
				speed
			}
		}
	}
`

const SET_SUNSET = gql`
	mutation setSunset(
		$mac: String!
		$startedAt: DateTime!
		$endingAt: DateTime!
	) {
		setSunset(mac: $mac, startedAt: $startedAt, endingAt: $endingAt) {
			startedAt
			endingAt
		}
	}
`

const CLEAR_SUNSET = gql`
	mutation clearSunset($mac: String!) {
		clearSunset(mac: $mac) {
			startedAt
			endingAt
		}
	}
`

const TOGGLE_SUNRISE = gql`
	mutation toggleSunrise($mac: String!) {
		toggleSunrise(mac: $mac) {
			isActive
			startingAt {
				hour
				minute
			}
		}
	}
`

const SET_SUNRISE_TIME = gql`
	mutation setSunriseTime($mac: String!, $startingAt: TimeInput!) {
		setSunriseTime(mac: $mac, startingAt: $startingAt) {
			isActive
			startingAt {
				hour
				minute
			}
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

	const [setBrightness, { loading: isSettingBrightness }] = useMutation(
		SET_BRIGHTNESS,
		{
			onCompleted: function () { },
		},
	)
	const [setAnimationSpeed] = useMutation(SET_ANIMATION_SPEED)

	const [setSunset] = useMutation(SET_SUNSET)
	const [clearSunset] = useMutation(CLEAR_SUNSET)

	const [setLedStripsAreSynced] = useMutation(SET_LEDSTRIPS_ARE_SYNCED)
	const [clearLedStripsAreSynced] = useMutation(CLEAR_LEDSTRIPS_ARE_SYNCED)

	const [toggleSunrise] = useMutation(TOGGLE_SUNRISE)
	const [setSunriseTime] = useMutation(SET_SUNRISE_TIME)

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
	function handleBrightnessChange(value) {
		setBrightness({
			variables: {
				mac: data.device.mac,
				ledStripId: data.device.ledStrips[selectedLedStrip - 1].id,
				brightness: value,
			},
		})
	}

	function handleAnimationSpeedChange(value) {
		setAnimationSpeed({
			variables: {
				mac: data.device.mac,
				ledStripId: data.device.ledStrips[selectedLedStrip - 1].id,
				animationSpeed: value,
			},
		})
	}

	function handleSunsetClick({ startedAt, endingAt }) {
		if (!startedAt || !endingAt)
			clearSunset({ variables: { mac: data.device.mac } })
		else setSunset({ variables: { mac: data.device.mac, startedAt, endingAt } })
	}

	function handleSunriseChange({ isActive, startingAt }) {
		if (isActive !== data.device.sunrise.isActive) {
			toggleSunrise({ variables: { mac: data.device.mac } })
		}

		if (startingAt !== data.device.sunrise.startingAt) {
			setSunriseTime({ variables: { mac: data.device.mac, startingAt } })
		}
	}

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
			<DebouncedRangeInput
				rows={3}
				cols={1}
				icon={faSun}
				range={{ min: 0, max: 1 }}
				value={data.device.ledStrips[selectedLedStrip - 1].brightness}
				debouncedOnInput={handleBrightnessChange}
			/>
			<DebouncedRangeInput
				rows={1}
				cols={3}
				icon={faRunning}
				range={{ min: 0, max: 1 }}
				value={data.device.ledStrips[selectedLedStrip - 1].animation.speed}
				debouncedOnInput={handleAnimationSpeedChange}
			/>
			<DebouncedSunriseInput
				value={{
					isActive: data.device.sunrise.isActive,
					startingAt: {
						hour: data.device.sunrise.startingAt.hour,
						minute: data.device.sunrise.startingAt.minute,
					},
				}}
				debouncedOnInput={handleSunriseChange}
			/>
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
			<ColorPicker value={{ saturation: 0, hue: 0 }} />
			<SunsetInput
				duration={5 * 60}
				startedAt={data.device.sunset.startedAt}
				endingAt={data.device.sunset.endingAt}
				onClick={handleSunsetClick}
			/>
		</>
	)
}

export default Device
