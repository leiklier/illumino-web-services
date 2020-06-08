import React, { useState, useEffect } from 'react'
import { FaTimesCircle } from 'react-icons/fa'

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
				<FaTimesCircle size={24} />
			</div>
		</div>
	)
}

export default StringInput
