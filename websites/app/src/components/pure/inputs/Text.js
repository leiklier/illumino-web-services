import React from 'react'
import { FaTimesCircle } from 'react-icons/fa'

import styles from './Text.css'

const TextInput = ({ placeholder, maxLength, value, onChange }) => {
	return (
		<div className={styles.container}>
			<input
				className={styles.input}
				value={value}
				onChange={e => onChange(e.target.value)}
				type="text"
				placeholder={placeholder}
				maxLength={maxLength}
			/>
			{ value.length ? 
				<FaTimesCircle
					size={24}
					onClick={() => onChange('')}
				/> : ''
			}
		</div>
	)
}

export default TextInput
