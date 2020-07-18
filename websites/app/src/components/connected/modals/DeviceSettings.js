import React, { useState } from 'react'
import { animated, useTrail } from 'react-spring'
import { FaTimes, FaSync } from 'react-icons/fa'
import BasicModal from '../../pure/modals/Basic'

// TEMP:
import LedStripGeometryInput from '../../pure/inputs/LedStripGeometry'

import ConnectedDeviceNameInput from '../inputs/DeviceName'
import ConnectedDeviceEnvironmentInput from '../inputs/DeviceEnvironment'

import * as Semantic from '../../pure/layouts/Semantic'
import styles from './DeviceSettings.css'

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
    const [geometry, setGeometry] = useState({
        TOP: 20,
        RIGHT: 59,
        LEFT: 30,
        BOTTOM: 20,
        START_CORNER: 'BOTTOM_RIGHT',
        ROTATION: 'CCW',
    })
    const settingsItems = [
        <h2>General</h2>,
        <GhostInput>
            <ConnectedDeviceNameInput secret={secret} />
        </GhostInput>,
        <GhostInput>
            <ConnectedDeviceEnvironmentInput secret={secret} />
        </GhostInput>,
        <UpdateAvailableAlert secret={secret} />,
        <h2>Dimensions</h2>,
        <LedStripGeometryInput
            ledStripName="TOP"
            value={geometry}
            onInput={setGeometry}
        />
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
                New update available! Scheduled <b>tonight 3:00</b> (<u>update now</u>).
            </div>
        </div>
    )
}

export default DeviceSettingsModal