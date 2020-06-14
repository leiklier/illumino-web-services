import React, { useState } from 'react'
import {useSpring, animated} from 'react-spring'
import { FaTimesCircle } from 'react-icons/fa'

import styles from './Text.css'

const TextInput = ({ label, maxLength, value, onInput }) => {
	const [isFocused, setIsFocused] = useState(false)

	const labelStyle = useSpring(
		isFocused || value.length ? 
			{
				transform: 'translate(0, 0rem)',
				fontSize: '0.9rem',
				top: '-0.9rem',
			} :
			{
				transform: 'translate(0, 1.2rem)',
				fontSize: '1.2rem',
				top: '-1.2rem',
			}
	)

	return (
		<div className={styles.container}>
			<div className={styles.inputContainer}>
				<animated.div style={labelStyle} className={styles.label}>
					{label}
					{isFocused || value.length ? ':' : '...'}
				</animated.div>
				<input
					value={value}
					className={styles.input}
					onChange={e => onInput(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					type="text"
					maxLength={maxLength}
				/>
			</div>
			{ value.length ? 
				<FaTimesCircle
					size={24}
					onClick={() => onInput('')}
				/> : ''
			}
		</div>
	)
}

export default TextInput
