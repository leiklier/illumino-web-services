import React from 'react'
import { animated, useTrail } from 'react-spring'
import { FaTimes } from 'react-icons/fa'
import BasicModal from '../../pure/modals/Basic'

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
    const settingsItems = [
        <h2>General</h2>,
        <GhostInput>
            <ConnectedDeviceNameInput secret={secret} />
        </GhostInput>,
        <GhostInput>
            <ConnectedDeviceEnvironmentInput secret={secret} />
        </GhostInput>,
    ]

    const trail = useTrail(settingsItems.length, {
        opacity: isOpen ? 1 : 0,
        top: isOpen ? '0px' : '120px',
        from: {opacity: 0, top: '120px'},
    })

    return(
        <div className={styles.content}>
            {trail.map((style, index) => (
                <animated.div
                    key={index}
                    style={style}
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

export default DeviceSettingsModal