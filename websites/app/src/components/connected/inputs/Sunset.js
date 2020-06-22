import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withApiDebounce from '../../../HOCs/with-api-debounce'
import SunsetInput from '../../pure/inputs/Sunset'
const DebouncedSunset = withApiDebounce(SunsetInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            id
			sunset {
				startedAt
				endingAt
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
            id
			sunset {
				startedAt
				endingAt
			}
        }
    }
`

const START_SUNSET = gql`
	mutation startSunset(
		$secret: String!
        $startedAt: DateTime!
        $endingAt: DateTime!
	) {
		startSunset(secret: $secret, startedAt: $startedAt, endingAt: $endingAt) {
            id
            sunset {
			    startedAt
			    endingAt
            }
		}
	}
`

const STOP_SUNSET = gql`
	mutation stopSunset($secret: String!) {
		stopSunset(secret: $secret) {
            id
            sunset {
			    startedAt
		    	endingAt
            }
		}
	}
`

const ConnectedSunriseInput = ({ secret, onInput, ...passthroughProps }) => {
    const { subscribeToMore, data } = useQuery(DEVICE_QUERY, {
        variables: { secret }
    })

    useEffect(() => {
        const unsubscribe = subscribeToMore({
            document: DEVICE_SUBSCRIPTION,
            variables: { secret },
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

    const [startSunset, { loading: startMutationIsLoading }] = useMutation(START_SUNSET)
    const [stopSunset, { loading: stopMutationIsLoading }] = useMutation(STOP_SUNSET)

    function handleInput(newSunsetValue) {
        if (newSunsetValue.startedAt) {
            startSunset({
                variables: {
                    secret,
                    startedAt: newSunsetValue.startedAt,
                    endingAt: newSunsetValue.endingAt,
                },
            })
        } else {
            stopSunset({ variables: { secret } })
        }
    }

    return (
        <DebouncedSunset
            value={sunset}
            onInput={() => onInput && onInput(sunset)}
            debouncedOnInput={handleInput}
            isCommiting={ startMutationIsLoading || stopMutationIsLoading }
            {...passthroughProps}
        />
    )
}

export default ConnectedSunriseInput