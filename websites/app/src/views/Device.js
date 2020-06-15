import React, { useState, useMemo } from 'react'

import { useSelector } from 'react-redux'
import jwt from 'jsonwebtoken'

import * as Grid from '../components/pure/layouts/Grid'

import ConnectedDeviceTitle from '../components/connected/DeviceTitle'

import ConnectedLedStripSelector from '../components/connected/inputs/LedStripSelector'
import ConnectedSensorButton from '../components/connected/inputs/SensorButton'

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

	const [selectedLedStripIndex, setSelectedLedStripIndex] = useState(0)

	if (!mac) return <></>

	return (
		<Grid.Layout 
			style={{ width: '100%', height: '100%' }}
			rows={8} cols={4}
		>
			<Grid.Item cols={4}>
				<ConnectedDeviceTitle mac={mac} />
			</Grid.Item>
			
			<Grid.Item cols={3}>
				<ConnectedAnimationTypeInput
					mac={mac}
					ledStripIndex={selectedLedStripIndex}
					horizontal
				/>
			</Grid.Item>
			
			<Grid.Item rows={3}>
				<ConnectedBrightnessInput
					mac={mac}
					ledStripIndex={selectedLedStripIndex}
					vertical
				/>
			</Grid.Item>

			<Grid.Item cols={3}>
				<ConnectedAnimationSpeedInput
					mac={mac}
					ledStripIndex={selectedLedStripIndex}
					horizontal
				/>
			</Grid.Item>

			<Grid.Item cols={3} rows={2}>
				<ConnectedSunriseInput mac={mac} />
			</Grid.Item>

			<Grid.Item>
				<ConnectedSensorButton mac={mac} />
			</Grid.Item>

			<Grid.Item>
				<ConnectedLedStripSelector
					mac={mac}
					value={selectedLedStripIndex}
					onInput={setSelectedLedStripIndex}
				/>
			</Grid.Item>

			<Grid.Item rows={3} cols={3}>
				<ConnectedColorInput
					mac={mac}
					ledStripIndex={selectedLedStripIndex}
					syncWithAppBackground
				/>
			</Grid.Item>

			<Grid.Item rows={2}>
				<ConnectedSunsetInput mac={mac} />
			</Grid.Item>
			
		</Grid.Layout>
	)
}


export default Device
