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
            environment
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
            id
            environment
        }
    }
`

const SET_DEVICE_ENVIRONMENT = gql`
	mutation setDeviceEnvironment(
		$secret: String!
		$environment: DeviceEnvironment!
	) {
		setDeviceEnvironment(
			secret: $secret
			environment: $environment
		) {
            id
			environment
		}
	}
`

const DEVICE_ENVIRONMENT_OPTIONS_QUERY = gql`
    query {
        __type(name: "DeviceEnvironment") {
            name
            enumValues {
                name
            }
        }
    }
`


const ConnectedDeviceEnvironmentInput = ({
    secret,
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

    const environment = useMemo(() => {
        const data = deviceData
        const dataIsFetched = data && data.device && data.device.environment
        if (!dataIsFetched) return 'BEDROOM'

        return data.device.environment
    }, [deviceData])
    
    const { data: deviceEnvironmentOptionsData } = useQuery(DEVICE_ENVIRONMENT_OPTIONS_QUERY)


    const deviceEnvironmentOptions = useMemo(() => {
        const data = deviceEnvironmentOptionsData
        const dataIsFetched = data && data.__type && data.__type.enumValues
        if (!dataIsFetched) return [{ name: 'Bedroom', value: 'BEDROOM' }]

        const allowedValues = data.__type.enumValues.map(value => value.name)
        return allowedValues.map(value => ({
            value,
            name: value.charAt(0).toUpperCase() +
                value
                    .replace('_', ' ')
                    .toLowerCase()
                    .slice(1)
        }))
    }, [deviceEnvironmentOptionsData])

    const [setDeviceEnvironment, { loading: mutationIsLoading }] = useMutation(SET_DEVICE_ENVIRONMENT)

    function handleInput(newEnvironment) {
        setDeviceEnvironment({
            variables: {
                secret,
                environment: newEnvironment,
            }
        })
    }

    return (
        <>
        <DebouncedSelectInput
            value={environment}
            options={deviceEnvironmentOptions}
            onInput={() => onInput && onInput(environment)}
            debouncedOnInput={handleInput}
            label="environment"
            isCommiting={mutationIsLoading}
            {...passthroughProps}
        />
        </>
    )
}

export default ConnectedDeviceEnvironmentInput