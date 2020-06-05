import React, { useEffect, useMemo } from 'react'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import RangeInput from '../pure/Range'
const DebouncedRangeInput = withDebounce(RangeInput)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				brightness
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				brightness
			}
        }
    }
`

const SET_BRIGHTNESS = gql`
	mutation setBrightness($mac: String!, $ledStripIndex: Int!, $brightness: Float!) {
		setBrightnessOnLedStrip(
			mac: $mac
			ledStripIndex: $ledStripIndex
			brightness: $brightness
		) {
			brightness
		}
	}
`

const ConnectedBrightnessInput = ({
    mac,
    ledStripIndex,
    onInput,
    ...passthroughProps
}) => {
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
                mac,
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
            icon={faSun}
            {...passthroughProps}
        />
    )
}

export default ConnectedBrightnessInput