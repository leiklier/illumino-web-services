import React, { useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { RiTempHotLine } from 'react-icons/ri'
import { WiHumidity } from 'react-icons/wi'

import styles from './SensorButton.css'

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            latestMeasurements(types: [TEMPERATURE, HUMIDITY]) {
				type
				value
			}
        }
    }
`

const ConnectedSensorButton = ({ secret }) => {
	const { data } = useQuery(DEVICE_QUERY, {
		variables: { secret }
	})

	const { humidity, temperature } = useMemo(() => {
		const dataIsFetched = data && data.device && data.device.latestMeasurements
		const temperature = dataIsFetched ?
							Math.round(
								data.device.latestMeasurements
									.find(m => m.type === 'TEMPERATURE').value
							 ) : 'N/A'

		const humidity = dataIsFetched ?
							Math.round(
								data.device.latestMeasurements
									.find(m => m.type === 'HUMIDITY').value * 100
								) : 'N/A'
		
		return { temperature, humidity }
	}, [data])

	return (
		<div className={styles.container}>
			<div className={styles.measurement}>
				<div><RiTempHotLine size={18} /></div>
				<div>{ temperature }°C</div>
			</div>

			<div  className={styles.measurement}>
				<div><WiHumidity size={18} /></div>
				<div>{ humidity }%</div>
			</div>
		</div>
	)
}

export default ConnectedSensorButton