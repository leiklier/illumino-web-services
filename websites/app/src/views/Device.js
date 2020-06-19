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
	const secret = useMemo(() => {
		if (!accessToken) return null
		const { payload } = jwt.decode(accessToken)

		return payload.device.secret
	}, [accessToken])

	const [selectedLedStripIndex, setSelectedLedStripIndex] = useState(0)

	if (!secret) return <></>

	return (
		<Grid.Layout 
			style={{ width: '100%', height: '100%' }}
			rows={8} cols={4}
		>
			<Grid.Item cols={4}>
				<ConnectedDeviceTitle secret={secret} />
			</Grid.Item>
			
			<Grid.Item cols={3}>
				<ConnectedAnimationTypeInput
					secret={secret}
					ledStripIndex={selectedLedStripIndex}
					horizontal
				/>
			</Grid.Item>
			
			<Grid.Item rows={3}>
				<ConnectedBrightnessInput
					secret={secret}
					ledStripIndex={selectedLedStripIndex}
					vertical
				/>
			</Grid.Item>

			<Grid.Item cols={3}>
				<ConnectedAnimationSpeedInput
					secret={secret}
					ledStripIndex={selectedLedStripIndex}
					horizontal
				/>
			</Grid.Item>

			<Grid.Item cols={3} rows={2}>
				<ConnectedSunriseInput secret={secret} />
			</Grid.Item>

			<Grid.Item>
				<ConnectedSensorButton secret={secret} />
			</Grid.Item>

			<Grid.Item>
				<ConnectedLedStripSelector
					secret={secret}
					value={selectedLedStripIndex}
					onInput={setSelectedLedStripIndex}
				/>
			</Grid.Item>

			<Grid.Item rows={3} cols={3}>
				<ConnectedColorInput
					secret={secret}
					ledStripIndex={selectedLedStripIndex}
					syncWithAppBackground
				/>
			</Grid.Item>

			<Grid.Item rows={2}>
				<ConnectedSunsetInput secret={secret} />
			</Grid.Item>
			
		</Grid.Layout>
	)
}


export default Device
