import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import styles from './String.css'

const StringInput = ({ placeholder, value: initialValue, onChange }) => {
	const [value, setValue] = useState(initialValue || '')

	useEffect(() => {
		if (!onChange) return
		onChange(value)
	}, [value])

	return (
		<div className={styles.container}>
			<input
				className={styles.input}
				value={value}
				onChange={e => setValue(e.target.value)}
				type="text"
				placeholder={placeholder}
			/>
			<div className={styles.icon} onClick={() => setValue('')}>
				<FontAwesomeIcon icon={faTimesCircle} size="lg" />
			</div>
		</div>
	)
}

export default StringInput
