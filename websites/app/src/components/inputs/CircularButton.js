import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './CircularButton.css'

const CircularButton = ({ icon, value: initialValue, onClick }) => {
	const [value, setValue] = useState(initialValue)

	// Emit click
	useEffect(() => {
		if (!onClick) return
		onClick(value)
	}, [value])

	return (
		<div className={styles.container}>
			<div
				className={classNames({
					[styles.button]: true,
					[styles.buttonIfOn]: value,
				})}
				onClick={() => setValue(!value)}
			>
				<FontAwesomeIcon icon={icon} size="2x" />
			</div>
		</div>
	)
}

export default CircularButton
