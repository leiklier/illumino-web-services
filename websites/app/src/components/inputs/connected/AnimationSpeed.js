import React, { useEffect, useMemo } from 'react'
import { faRunning } from '@fortawesome/free-solid-svg-icons'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import RangeInput from '../pure/Range'
const DebouncedRangeInput = withDebounce(RangeInput)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				animation {
					speed
				}
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				animation {
					speed
				}
			}
        }
    }
`

const SET_ANIMATION_SPEED = gql`
	mutation setAnimationSpeed(
		$mac: String!
		$ledStripIndex: Int!
		$animationSpeed: Float!
	) {
		setAnimationSpeedOnLedStrip(
			mac: $mac
			ledStripIndex: $ledStripIndex
			animationSpeed: $animationSpeed
		) {
			animation {
				speed
			}
		}
	}
`


const ConnectedAnimationSpeedInput = ({
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

    const animationSpeed = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) return 0

        const ledStrip = data.device.ledStrips[ledStripIndex]
        if (!ledStrip) return 0

        return ledStrip.animation.speed
    }, [data, ledStripIndex])

    const [setAnimationSpeed] = useMutation(SET_ANIMATION_SPEED)

    function handleInput(newAnimationSpeed) {
        setAnimationSpeed({
            variables: {
                mac,
                ledStripIndex,
                animationSpeed: newAnimationSpeed,
            }
        })
    }

    return (
        <DebouncedRangeInput
            key={ledStripIndex}
            value={animationSpeed}
            range={{ min: 0, max: 1 }}
            onInput={() => onInput && onInput()}
            debouncedOnInput={handleInput}
            icon={faRunning}
            {...passthroughProps}
        />
    )
}

export default ConnectedAnimationSpeedInput