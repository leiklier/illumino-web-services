import React, { useEffect, useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import styles from './LedStripSelector.css'

const DEVICE_QUERY = gql`
    query getDevice($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				id
				name
			}
        }
    }
`

const DEVICE_SUBSCRIPTION = gql`
    subscription onDeviceUpdated($mac: String!) {
        device(mac: $mac) {
            ledStrips {
				id
				name
			}
        }
    }
`


const ConnectedLedStripSelector = ({ mac, value, onInput }) => {
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
	
	const ledStripNames = useMemo(() => {
		const dataIsFetched = data && data.device && data.device.ledStrips
		if(!dataIsFetched) return []
		return data.device.ledStrips.map(l => l.name)
	})


	const selectedLedStripName = useMemo(() => {
		if(!ledStripNames) return 'N/A'

		return ledStripNames[value]
	}, [ledStripNames, value])

	function handleClick() {
		if (value + 1 === ledStripNames.length) return onInput(0)
		onInput(value + 1)
	}

	return(
		<div className={styles.container} onClick={handleClick}>
			<div className={styles.value}>
				{selectedLedStripName}
			</div>
			<div className={styles.label}>
				LEDSTRIP
			</div>
		</div>
	)
}

export default ConnectedLedStripSelector