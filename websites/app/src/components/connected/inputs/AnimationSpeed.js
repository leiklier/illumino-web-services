import React, { useEffect, useMemo } from 'react'
import { RiSpeedLine } from 'react-icons/ri'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import RangeInput from '../../pure/inputs/Range'
const DebouncedRangeInput = withDebounce(RangeInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            ledStrips {
				animation {
					speed
				}
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
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
		$secret: String!
		$ledStripIndex: Int!
		$animationSpeed: Float!
	) {
		setAnimationSpeedOnLedStrip(
			secret: $secret
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
                secret,
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
            onInput={() => onInput && onInput(animationSpeed)}
            debouncedOnInput={handleInput}
            Icon={RiSpeedLine}
            {...passthroughProps}
        />
    )
}

export default ConnectedAnimationSpeedInput