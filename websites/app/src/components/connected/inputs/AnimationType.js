import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withDebounce from '../../../HOCs/with-debounce'
import SelectInput from '../../pure/inputs/Select'
const DebouncedSelectInput = withDebounce(SelectInput)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				animation {
					type
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
					type
				}
			}
        }
    }
`

const SET_ANIMATION_TYPE = gql`
	mutation setAnimationSpeed(
		$mac: String!
		$ledStripIndex: Int!
		$animationType: AnimationType!
	) {
		setAnimationTypeOnLedStrip(
			mac: $mac
			ledStripIndex: $ledStripIndex
			animationType: $animationType
		) {
			animation {
				type
			}
		}
	}
`

const ANIMATION_TYPE_OPTIONS_QUERY = gql`
    query {
        __type(name: "AnimationType") {
            name
            enumValues {
                name
            }
        }
    }
`


const ConnectedAnimationTypeInput = ({
    mac,
    ledStripIndex,
    onInput,
    ...passthroughProps
}) => {
    const { subscribeToMore, data: deviceData } = useQuery(DEVICE_QUERY, {
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

    const { data: animationTypeOptionsData } = useQuery(ANIMATION_TYPE_OPTIONS_QUERY)

    const animationType = useMemo(() => {
        const data = deviceData
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) return 'MANUAL'

        const ledStrip = data.device.ledStrips[ledStripIndex]

        return ledStrip.animation.type
    }, [deviceData, ledStripIndex])

    const animationTypeOptions = useMemo(() => {
        const data = animationTypeOptionsData
        const dataIsFetched = data && data.__type && data.__type.enumValues
        if (!dataIsFetched) return [{ name: 'Manual', value: 'MANUAL' }]

        const allowedValues = data.__type.enumValues.map(value => value.name)
        return allowedValues.map(value => ({
            value,
            name: value.charAt(0).toUpperCase() +
                value
                    .replace('_', ' ')
                    .toLowerCase()
                    .slice(1)
        }))
    }, [animationTypeOptionsData])

    const [setAnimationType] = useMutation(SET_ANIMATION_TYPE)

    function handleInput(newAnimationType) {
        setAnimationType({
            variables: {
                mac,
                ledStripIndex,
                animationType: newAnimationType,
            }
        })
    }

    return (
        <DebouncedSelectInput
            key={ledStripIndex}
            value={animationType}
            options={animationTypeOptions}
            onInput={() => onInput && onInput(animationType)}
            debouncedOnInput={handleInput}
            label={'animation'}
            {...passthroughProps}
        />
    )
}

export default ConnectedAnimationTypeInput