import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import styles from './RemovableButton.css'

const RemovableButton = ({ onClick, onDelete, children }) => {
	return (
		<div className={styles.container}>
			<div className={styles.text} onClick={onClick}>
				{children}
			</div>
			<div className={styles.icon} onClick={onDelete}>
				<FontAwesomeIcon icon={faTimesCircle} size="lg" />
			</div>
		</div>
	)
}

export default RemovableButton
