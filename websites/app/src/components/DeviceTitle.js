import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChevronLeft,
	faChevronRight,
	faCog,
	faSync,
	faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import styles from './DeviceTitle.css'

const DeviceTitle = ({ onLogout, children }) => {
	const [buttonsAreShown, setButtonsAreShown] = useState(false)
	return (
		<div className={styles.container}>
			<span className={styles.text}>{children}</span>
			<div className={styles.buttonsContainer}>
				<FontAwesomeIcon
					onClick={() => setButtonsAreShown(!buttonsAreShown)}
					icon={buttonsAreShown ? faChevronRight : faChevronLeft}
					size="2x"
				/>
				<FontAwesomeIcon icon={faCog} size="2x" />
				{buttonsAreShown ? <FontAwesomeIcon icon={faSync} size="2x" /> : ''}
				{buttonsAreShown ? (
					<div onClick={onLogout}>
						<FontAwesomeIcon icon={faSignOutAlt} size="2x" />
					</div>
				) : (
					''
				)}
			</div>
		</div>
	)
}

export default DeviceTitle
