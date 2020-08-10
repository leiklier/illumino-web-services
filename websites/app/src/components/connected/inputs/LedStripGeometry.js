import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withApiDebounce from '../../../HOCs/with-api-debounce'
import LedStripGeometryInput from '../../pure/inputs/LedStripGeometry'
const DebouncedLedStripGeometryInput = withApiDebounce(LedStripGeometryInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
			id
            ledStrips {
                id
                name
                geometry {
                    dimensions {
                        top
                        right
                        bottom
                        left
                    }
                    startCorner
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
                name
                geometry {
                    dimensions {
                        top
                        right
                        bottom
                        left
                    }
                    startCorner
                }
			}
        }
    }
`

const CHANGE_LED_STRIP_GEOMETRY = gql`
    mutation setGeometryOnLedStrip(
        $secret: String!
        $ledStripIndex: Int!
        $geometry: GeometryInput!) {
            setGeometryOnLedStrip(
                secret: $secret
                ledStripIndex: $ledStripIndex
                geometry: $geometry
            ) {
                id
                geometry {
                    dimensions {
                        top
                        right
                        bottom
                        left
                    }
                    startCorner
                }
            }
        }
`

const ConnectedLedStripGeometryInput = ({
    secret,
    ledStripIndex,
    onInput,
    ...passThroughProps
}) => {
    const { subscribeToMore, data } = useQuery(DEVICE_QUERY, {
        variables: { secret }
    })

    const [
        changeLedStripGeometry,
        { loading: mutationIsLoading },
    ] = useMutation(CHANGE_LED_STRIP_GEOMETRY)

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

    const geometry = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) {
            return {
                dimensions: {
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                },
                startCorner: 'bottomLeft',
            }
        }

        return data.device.ledStrips[ledStripIndex].geometry
    }, [data, ledStripIndex])

    const name = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) return 'N/A'

        return data.device.ledStrips[ledStripIndex].name
    }, [data, ledStripIndex])

    function handleInput(newGeometry) {
        changeLedStripGeometry({
            variables: {
                secret,
                ledStripIndex,
                geometry: newGeometry,
            },
        })
    }

    return (
        <DebouncedLedStripGeometryInput
            ledStripName={name}
            value={{
                dimensions: {
                    top: geometry.dimensions.top,
                    right: geometry.dimensions.right,
                    bottom: geometry.dimensions.bottom,
                    left: geometry.dimensions.left,
                },
                startCorner: geometry.startCorner,
            }}
            onInput={() => onInput && onInput(geometry)}
            debouncedOnInput={handleInput}
            isCommiting={mutationIsLoading}
            {...passThroughProps}
        />
    )    
}

export default ConnectedLedStripGeometryInput