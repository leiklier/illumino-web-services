import React, { useEffect, useMemo } from 'react'
import { FaCog, FaSync, FaSignOutAlt } from 'react-icons/fa'
import gql from 'graphql-tag'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { useDispatch } from 'react-redux'
import {
    clearSelectedSecret,
    clearAccessToken,
} from '../../store/actions'

import TitleWithActions from '../pure/TitleWithActions'
import IsDisconnectedIndicator from './IsDisconnectedIndicator'

const DEVICE_QUERY = gql`
	query getDevice($mac: String!) {
		device(mac: $mac) {
			mac
			name
		}
	}
`

const DEVICE_SUBSCRIPTION = gql`
	subscription onDeviceUpdated($mac: String!) {
		device(mac: $mac) {
			mac
			name
		}
	}
`

const LOGOUT = gql`
	query logout {
		logout
	}
`

const ConnectedDeviceTitle = ({ mac, ...passthroughProps }) => {
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

    const [handleLogout] = useLazyQuery(LOGOUT, {
        onCompleted: () => {
            // Remove accessToken after
            // removing refreshToken in order
            // to avoid race around condition:
            dispatch(clearSelectedSecret())
            dispatch(clearAccessToken())
        }
    })

    const titleText = useMemo(() => {
        const dataIsFetched = data && data.device
        if (!dataIsFetched) return 'IllumiNode'

        return data.device.name ? data.device.name : data.device.mac
    }, [data])

    const actions = [
        {
            name: 'settings',
            Icon: FaCog,
            execute: () => console.log('Opening settings...'),
        },
        {
            name: 'update',
            Icon: FaSync,
            execute: () => console.log('Updating firmware...'),
        },
        {
            name: 'logout',
            Icon: FaSignOutAlt,
            execute: handleLogout,
        },
    ]

    return (
        <TitleWithActions actions={actions} {...passthroughProps}>
            <IsDisconnectedIndicator mac={mac} />
            <div>{titleText}</div>
        </TitleWithActions>
    )
}

export default ConnectedDeviceTitle