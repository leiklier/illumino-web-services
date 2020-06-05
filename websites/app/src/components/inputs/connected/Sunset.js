import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import SunsetInput from '../pure/Sunset'
const DebouncedSunset = withDebounce(SunsetInput)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
			sunset {
				startedAt
				endingAt
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
			sunset {
				startedAt
				endingAt
			}
        }
    }
`

const START_SUNSET = gql`
	mutation startSunset(
		$mac: String!
        $startedAt: DateTime!
        $endingAt: DateTime!
	) {
		startSunset(mac: $mac, startedAt: $startedAt, endingAt: $endingAt) {
			startedAt
			endingAt
		}
	}
`

const STOP_SUNSET = gql`
	mutation stopSunset($mac: String!) {
		stopSunset(mac: $mac) {
			startedAt
			endingAt
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

    const sunset = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.sunset
        const sunset = {
            startedAt: dataIsFetched ? data.device.sunset.startedAt : null,
            endingAt: dataIsFetched ? data.device.sunset.endingAt : null,
        }
        return sunset
    }, [data])

    const [startSunset] = useMutation(START_SUNSET)
    const [stopSunset] = useMutation(STOP_SUNSET)

    function handleInput(newSunsetValue) {
        if (newSunsetValue.startedAt) {
            startSunset({
                variables: {
                    mac,
                    startedAt: newSunsetValue.startedAt,
                    endingAt: newSunsetValue.endingAt,
                },
            })
        } else {
            stopSunset({ variables: { mac } })
        }
    }

    return (
        <DebouncedSunset
            value={sunset}
            onInput={() => onInput && onInput(sunset)}
            debouncedOnInput={handleInput}
            {...passthroughProps}
        />
    )
}

export default ConnectedSunriseInput