import React, { useState, useEffect, useMemo } from 'react'
import useInterval from '../../hooks/use-interval'
import { useSpring, animated } from 'react-spring'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { RiWifiOffLine } from 'react-icons/ri'
import styles from './IsDisconnectedIndicator.css'

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            id
            isConnected
            lastSeenAt
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($secret: String!) {
        device(secret: $secret) {
            id
            isConnected
            lastSeenAt
        }
    }
`

const IsDisconnectedIndicator = ({ secret }) => {
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


    const { isConnected, lastSeenAt } = useMemo(() => {
        const dataIsFetched = data && data.device
        if (!dataIsFetched) return { isConnected: true }
        return data.device
    }, [data])

    const [timeElapsedText, setTimeElapsedText] = useState('')
    useInterval(() => {
        const lastSeenAt_MS = new Date(lastSeenAt).getTime()
        const timeElapsed_S = Math.ceil((Date.now() - lastSeenAt_MS) / 1000)

        // Seconds
        if (timeElapsed_S < 60) {
            setTimeElapsedText(timeElapsed_S + 's')
            return
        }

        // Minutes
        const timeElapsed_M = Math.floor(timeElapsed_S / 60)
        if (timeElapsed_M < 60) {
            setTimeElapsedText(timeElapsed_M + 'm')
            return
        }

        // Hours
        const timeElapsed_H = Math.floor(timeElapsed_M / 60)
        if (timeElapsed_H < 24) {
            setTimeElapsedText(timeElapsed_H + 'h')
            return
        }

        // Days
        const timeElapsed_D = Math.floor(timeElapsed_H / 24)
        if (timeElapsed_D < 30) {
            setTimeElapsedText(timeElapsed_D + 'd')
            return
        }

        // Months (this is inaccurate right now, fix later)
        const timeElapsed_Mo = Math.floor(timeElapsed_D / 30)
        setTimeElapsedText(timeElapsed_Mo + 'mo')


    }, !(isConnected && lastSeenAt) ? 1000 : null)


    const containerStyle = useSpring({
        minWidth: isConnected ? '0rem' : '2.25rem',
        maxWidth: isConnected ? '0rem' : '2.25rem',
        opacity: isConnected ? 0 : 1,
    })


    return (
        <animated.div className={styles.container} style={containerStyle}>
            <RiWifiOffLine size={16} />
            <div>{timeElapsedText}</div>
        </animated.div>
    )
}

export default IsDisconnectedIndicator