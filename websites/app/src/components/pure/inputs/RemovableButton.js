import React from 'react'
import { FaTimesCircle } from 'react-icons/fa'
import styles from './RemovableButton.css'

const RemovableButton = ({ onClick, onDelete, children }) => {
	return (
		<div className={styles.container}>
			<div className={styles.text} onClick={onClick}>
				{children}
			</div>
			<div className={styles.icon} onClick={onDelete}>
				<FaTimesCircle size={24} />
			</div>
		</div>
	)
}

export default RemovableButton
