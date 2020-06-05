import React, { useEffect, useMemo } from 'react'

import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { useDispatch } from 'react-redux'
import { setBackgroundColor } from '../../../store/actions'
import { hsvToRgb } from '../../../lib/color'

import withDebounce from '../../../HOCs/with-debounce'
import ColorPicker from '../pure/ColorPicker'
const DebouncedColorPicker = withDebounce(ColorPicker)

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				color {
                    hue
                    saturation
                }
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				color {
                    hue
                    saturation
                }
			}
        }
    }
`

const SET_COLOR = gql`
	mutation setColorOnLedStrip($mac: String!, $ledStripIndex: Int!, $hue: Float!, $saturation: Float!) {
		setColorOnLedStrip(
			mac: $mac
			ledStripIndex: $ledStripIndex
			color: {
                hue: $hue
                saturation: $saturation
            }
		) {
			color {
                hue
                saturation
            }
		}
	}
`

const ConnectedColorInput = ({
    mac,
    ledStripIndex,
    onInput,
    syncWithAppBackground,
    ...passthroughProps
}) => {
    const dispatch = useDispatch()

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

    const [setColor] = useMutation(SET_COLOR)

    function handleInput({ hue, saturation }) {
        setColor({
            variables: {
                mac,
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
            {...passthroughProps}
        />
    )
}

export default ConnectedColorInput