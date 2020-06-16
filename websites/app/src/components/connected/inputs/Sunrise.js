import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import SunriseInput from '../../pure/inputs/Sunrise'
const DebouncedSunriseInput = withDebounce(SunriseInput)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
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
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
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

const UPDATE_SUNRISE = gql`
	mutation updateSunrise($mac: String!, $startingAt: TimeInput!, $isActive: Boolean!) {
		updateSunrise(mac: $mac, startingAt: $startingAt, isActive: $isActive) {
			isActive
			startingAt {
				hour
				minute
			}
		}
	}
`


const ConnectedSunriseInput = ({ mac, onInput, ...passthroughProps }) => {
	const { subscribeToMore, data } = useQuery(DEVICE_QUERY, {
		variables: { mac }
	})

	useEffect(() => {
		const unsubscribe = subscribeToMore({
			document: DEVICE_SUBSCRIPTION,
			variables: { mac },
			updateQuery: (prev, { subscriptionData }) => {
				if (!subscriptionData.data) return prev
				const updatedDevice = subscriptionData.data.device

				return Object.assign({}, prev, { device: updatedDevice })
			}
		})
		return () => unsubscribe()
	}, [])

	const sunrise = useMemo(() => {
		const dataIsFetched = data && data.device && data.device.sunrise
		const sunrise = {
			isActive: dataIsFetched ? data.device.sunrise.isActive : false,
			startingAt: {
				hour: dataIsFetched ? data.device.sunrise.startingAt.hour : 0,
				minute: dataIsFetched ? data.device.sunrise.startingAt.minute : 0,
			},
		}
		return sunrise
	}, [data])

	const [updateSunrise] = useMutation(UPDATE_SUNRISE)

	function handleInput(newSunriseValue) {
		updateSunrise({
			variables: {
				mac,
				...newSunriseValue,
			}
		})

	}

	return (
		<DebouncedSunriseInput
			value={sunrise}
			onInput={() => onInput && onInput(sunrise)}
			debouncedOnInput={handleInput}
			{...passthroughProps}
		/>
	)
}

export default ConnectedSunriseInput