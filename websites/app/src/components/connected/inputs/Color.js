import React, { useEffect, useMemo } from 'react'

import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { useDispatch } from 'react-redux'
import { setBackgroundColor } from '../../../store/actions'
import { hsvToRgb } from '../../../lib/color'

import withApiDebounce from '../../../HOCs/with-api-debounce'
import ColorPicker from '../../pure/inputs/ColorPicker'
const DebouncedColorPicker = withApiDebounce(ColorPicker)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            id
            ledStrips {
                id
				color {
                    hue
                    saturation
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
				color {
                    hue
                    saturation
                }
			}
        }
    }
`

const SET_COLOR = gql`
	mutation setColorOnLedStrip($secret: String!, $ledStripIndex: Int!, $hue: Float!, $saturation: Float!) {
		setColorOnLedStrip(
			secret: $secret
			ledStripIndex: $ledStripIndex
			color: {
                hue: $hue
                saturation: $saturation
            }
		) {
            id
			color {
                hue
                saturation
            }
		}
	}
`

const ConnectedColorInput = ({
    secret,
    ledStripIndex,
    onInput,
    syncWithAppBackground,
    ...passthroughProps
}) => {
    const dispatch = useDispatch()

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

    const color = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.ledStrips
        if (!dataIsFetched) return { hue: 0, saturation: 0 }

        const ledStrip = data.device.ledStrips[ledStripIndex]

        return {
            hue: ledStrip.color.hue,
            saturation: ledStrip.color.saturation
        }
    }, [data, ledStripIndex])

    useEffect(() => {
        if (!syncWithAppBackground) return

        const { red, green, blue } = hsvToRgb(color.hue, color.saturation, 0.8)
        dispatch(setBackgroundColor(red, green, blue))
    }, [color])

    const [setColor, { loading: mutationIsLoading }] = useMutation(SET_COLOR)

    function handleInput({ hue, saturation }) {
        setColor({
            variables: {
                secret,
                ledStripIndex,
                hue,
                saturation,
            }
        })
    }

    return (
        <DebouncedColorPicker
            key={ledStripIndex}
            value={color}
            onInput={() => onInput && onInput(color)}
            debouncedOnInput={handleInput}
            isCommiting={mutationIsLoading}
            {...passthroughProps}
        />
    )
}

export default ConnectedColorInput