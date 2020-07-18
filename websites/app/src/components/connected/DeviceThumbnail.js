import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { FaBed } from 'react-icons/fa'
import { GiSofa, GiHomeGarage } from 'react-icons/gi'
import { MdKitchen } from 'react-icons/md'
import { GrStatusUnknown } from 'react-icons/gr'

import IsDisconnectedIndicator from './IsDisconnectedIndicator'
import styles from './DeviceThumbnail.css'

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

const DeviceThumbnail = ({ secret }) => {
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

    const EnvironmentIcon = useMemo(() => {
        const data = deviceData
        const dataIsFetched = data && data.device && data.device.environment
        if (!dataIsFetched) return FaBed

        switch(data.device.environment) {
            case 'BEDROOM': return FaBed
            case 'LIVINGROOM': return GiSofa
            case 'GARAGE': return GiHomeGarage
            case 'KITCHEN': return MdKitchen
            default: return GrStatusUnknown
        }
    }, [deviceData])

    return (
        <div className={styles.container}>
            <IsDisconnectedIndicator secret={secret} />
            <EnvironmentIcon size={32}/>
        </div>
    )
}

export default DeviceThumbnail