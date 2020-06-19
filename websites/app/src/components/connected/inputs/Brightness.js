import React, { useEffect, useMemo } from 'react'
import { FiSun } from 'react-icons/fi'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import RangeInput from '../../pure/inputs/Range'
const DebouncedRangeInput = withDebounce(RangeInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            ledStrips {
				brightness
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
            ledStrips {
				brightness
			}
        }
    }
`

const SET_BRIGHTNESS = gql`
	mutation setBrightness($secret: String!, $ledStripIndex: Int!, $brightness: Float!) {
		setBrightnessOnLedStrip(
			secret: $secret
			ledStripIndex: $ledStripIndex
			brightness: $brightness
		) {
			brightness
		}
	}
`

const ConnectedBrightnessInput = ({
    secret,
    ledStripIndex,
    onInput,
    ...passthroughProps
}) => {
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

    const brightness = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) return 0

        const ledStrip = data.device.ledStrips[ledStripIndex]
        if (!ledStrip) return 0

        return ledStrip.brightness
    }, [data, ledStripIndex])

    const [setBrightness] = useMutation(SET_BRIGHTNESS)

    function handleInput(newBrightnessValue) {
        setBrightness({
            variables: {
                secret,
                ledStripIndex,
                brightness: newBrightnessValue,
            }
        })
    }

    return (
        <DebouncedRangeInput
            key={ledStripIndex}
            value={brightness}
            range={{ min: 0, max: 1 }}
            onInput={() => onInput && onInput(brightness)}
            debouncedOnInput={handleInput}
            Icon={FiSun}
            {...passthroughProps}
        />
    )
}

export default ConnectedBrightnessInput