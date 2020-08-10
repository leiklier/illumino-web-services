import React, { useMemo, useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { animated, useTrail } from 'react-spring'
import { FaTimes, FaSync } from 'react-icons/fa'

import BasicModal from '../../pure/modals/Basic'
import SelectInput from '../../pure/inputs/Select'
import MultiToggle from '../../pure/inputs/MultiToggle'
import ConnectedLedStripGeometryInput from '../../connected/inputs/LedStripGeometry'
import ConnectedDeviceNameInput from '../inputs/DeviceName'
import ConnectedDeviceEnvironmentInput from '../inputs/DeviceEnvironment'

import * as Semantic from '../../pure/layouts/Semantic'
import styles from './DeviceSettings.css'

const LED_STRIPS_QUERY = gql`
    query getLedStrips($secret: String!) {
        device(secret: $secret) {
            id
            ledStrips {
                id
                name
            }
        }
    }
`

const DeviceSettingsModal = ({ secret, isOpen, onClose }) => {
    return(
        <BasicModal isOpen={isOpen}>
            <Semantic.Layout>
                <Semantic.Header>
                    <div className={styles.header}>
                        <h1>Settings</h1>
                        <div onClick={onClose}><FaTimes size={36}/></div>
                    </div>
                </Semantic.Header>
                <Semantic.Main>
                    <SettingsContent secret={secret} isOpen={isOpen} />
                </Semantic.Main>
            </Semantic.Layout>
        </BasicModal>
    )
}

// Since BasicModal unmounts after finishing spring
// when isOpen: true -> false, SettingsContent has
// to exist in a self-contained component in order
// not to leak memory (otherwise, the child components
// of BasicModal would unmount while `trail` continues to 
// update).
function SettingsContent({ secret, isOpen }) {
    const [ledStripIndex, setLedStripIndex] = useState(0)
    const { data: ledStripsData } = useQuery(LED_STRIPS_QUERY, {
        variables: { secret },
    })
    
    const ledStrips = useMemo(() => {
        const dataIsFetched = ledStripsData && ledStripsData.device && ledStripsData.device.ledStrips
        if(!dataIsFetched) return []

        return ledStripsData.device.ledStrips
    }, [ledStripsData])


    const settingsItems = [
        <h2>General</h2>,
        <GhostInput>
            <ConnectedDeviceNameInput secret={secret} />
        </GhostInput>,
        <GhostInput>
            <ConnectedDeviceEnvironmentInput secret={secret} />
        </GhostInput>,
        <UpdateAvailableAlert secret={secret} />,
        <SectionSpacer />,
        
        <div className={styles.subHeader}>
            <h2>Dimensions</h2>
            {ledStrips.length ?
                <MultiToggle
                    key={ledStrips}
                    value={ledStripIndex}
                    onInput={setLedStripIndex}
                    options={ledStrips.map((ledStrip, index) => ({
                        name: ledStrip.name,
                        value: index,
                    }))}
                /> : ''
            }
        </div>,
        <SelectInput
            value={ledStripIndex}
            onInput={setLedStripIndex}
            hideButtons
            disableSwipe
            options={ledStrips.map((ledStrip, index) => ({
                name: (
                        <ConnectedLedStripGeometryInput
                            secret={secret}
                            ledStripIndex={index}
                        />
                    ),
                value: index,
            }))}
        />
        ,
    ]

    const trail = useTrail(settingsItems.length, {
        opacity: isOpen ? 1 : 0,
        top: isOpen ? '0vh' : '100vh',
        from: {opacity: 0, top: '100vh'},
    })

    return(
        <div className={styles.content}>
            {trail.map((style, index) => (
                <animated.div
                    key={index}
                    style={{ ...style, width: '100%' }}
                >
                    {settingsItems[index]}
                </animated.div>
            ))}
        </div>
    )
}

function SectionSpacer() {
    return <div className={styles.sectionSpacer} />
}

function GhostInput({ children }) {
    return (
        <div className={styles.ghostInput}>{children}</div>
    )
}

function UpdateAvailableAlert({ secret }) {
    return (
        <div className={styles.updateAvailableAlert}>
            <div><FaSync size={24} /></div>
            <div>
                New update available! Scheduled <b>tonight at 3 AM</b> (<u>update now</u>).
            </div>
        </div>
    )
}

export default DeviceSettingsModal