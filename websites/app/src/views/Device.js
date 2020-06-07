import React, { useState, useMemo } from 'react'

import { useSelector } from 'react-redux'
import jwt from 'jsonwebtoken'

import { faChartBar } from '@fortawesome/free-solid-svg-icons'

import ConnectedDeviceTitle from '../components/connected/DeviceTitle'
import CircularButton from '../components/pure/inputs/CircularButton'

import ConnectedSunriseInput from '../components/connected/inputs/Sunrise'
import ConnectedSunsetInput from '../components/connected/inputs/Sunset'

import ConnectedBrightnessInput from '../components/connected/inputs/Brightness'
import ConnectedColorInput from '../components/connected/inputs/Color'
import ConnectedAnimationSpeedInput from '../components/connected/inputs/AnimationSpeed'
import ConnectedAnimationTypeInput from '../components/connected/inputs/AnimationType'

const Device = () => {
	const accessToken = useSelector(state => state.auth.accessToken)
	const mac = useMemo(() => {
		if (!accessToken) return null
		const { payload } = jwt.decode(accessToken)

		return payload.device.mac
	}, [accessToken])

	const [selectedLedStripIndex, setSelectedLedStrip] = useState(0)

	if (!mac) return <></>

	return (
		<>
			<ConnectedDeviceTitle mac={mac} />
			<ConnectedAnimationTypeInput
				cols={3}
				mac={mac}
				ledStripIndex={selectedLedStripIndex}
			/>
			<ConnectedBrightnessInput
				rows={3}
				cols={1}
				mac={mac}
				ledStripIndex={selectedLedStripIndex}
			/>
			<ConnectedAnimationSpeedInput
				rows={1}
				cols={3}
				mac={mac}
				ledStripIndex={selectedLedStripIndex}
			/>
			<ConnectedSunriseInput mac={mac} />
			<CircularButton icon={faChartBar} iconColor="rgb(50, 92, 168)" />
			<ConnectedColorInput
				mac={mac}
				ledStripIndex={selectedLedStripIndex}
				syncWithAppBackground
			/>
			<ConnectedSunsetInput mac={mac} />
		</>
	)
}


export default Device
