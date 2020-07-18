import React from 'react'
import { FaTimes } from 'react-icons/fa'
import BasicModal from '../../pure/modals/Basic'

import ConnectedDeviceNameInput from '../inputs/DeviceName'
import ConnectedDeviceEnvironmentInput from '../inputs/DeviceEnvironment'

import * as Semantic from '../../pure/layouts/Semantic'
import styles from './DeviceSettings.css'


const DeviceSettingsModal = ({ secret, onClose }) => {
    return(
        <BasicModal>
            <Semantic.Layout>
                <Semantic.Header>
                    <div className={styles.header}>
                        <h1>Settings</h1>
                        <div onClick={onClose}><FaTimes size={36}/></div>
                    </div>
                </Semantic.Header>
                <Semantic.Main>
                    <h2>General</h2>
                    <InputGroup>
                        <ConnectedDeviceNameInput secret={secret} />
                        <ConnectedDeviceEnvironmentInput secret={secret} />
                    </InputGroup>
                </Semantic.Main>
            </Semantic.Layout>
        </BasicModal>
    )
}

function InputGroup({ children }) {
    return (
        <div className={styles.inputGroup}>{children}</div>
    )
}

export default DeviceSettingsModal