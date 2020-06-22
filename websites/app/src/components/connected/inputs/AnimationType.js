import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withApiDebounce from '../../../HOCs/with-api-debounce'
import SelectInput from '../../pure/inputs/Select'
const DebouncedSelectInput = withApiDebounce(SelectInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            id
            ledStrips {
                id
				animation {
					type
				}
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
            id
            ledStrips {
                id
				animation {
					type
				}
			}
        }
    }
`

const SET_ANIMATION_TYPE = gql`
	mutation setAnimationType(
		$secret: String!
		$ledStripIndex: Int!
		$animationType: AnimationType!
	) {
		setAnimationTypeOnLedStrip(
			secret: $secret
			ledStripIndex: $ledStripIndex
			animationType: $animationType
		) {
            id
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
    secret,
    ledStripIndex,
    onInput,
    ...passthroughProps
}) => {
    const { subscribeToMore, data: deviceData } = useQuery(DEVICE_QUERY, {
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

    const [setAnimationType, { loading: mutationIsLoading }] = useMutation(SET_ANIMATION_TYPE)

    function handleInput(newAnimationType) {
        setAnimationType({
            variables: {
                secret,
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
            isCommiting={mutationIsLoading}
            label={'animation'}
            {...passthroughProps}
        />
    )
}

export default ConnectedAnimationTypeInput