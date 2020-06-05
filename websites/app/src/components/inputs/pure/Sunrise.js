import React, { useState, useEffect } from 'react'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import CircularButton from './CircularButton'
import SelectInput from './Select'
import styles from './Sunrise.css'

const SunRiseInput = ({ value, onInput }) => {
	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.name}>Sunrise Morning</div>
				<div className={styles.buttonToggle}>
					<CircularButton
						icon={faSun}
						value={value.isActive}
						onClick={isActive => {
							onInput({
								...value,
								isActive,
							})
						}}
						type="ghost"
						iconColor="rgba(255, 255, 75, 0.7)"
					/>
				</div>
				<div className={styles.clockInputContainer}>
					<SelectInput
						font="seven-segment"
						rows={2}
						value={String(value.startingAt.hour).padStart(2, '0')}
						options={[...Array(24).keys()].map(i => String(i + 1).padStart(2, '0')).reverse()}
						onInput={hour => {
							onInput({
								...value,
								startingAt: {
									...value.startingAt,
									hour: parseInt(hour),
								},
							})
						}}
					/>
					<div className={styles.clockInputSeparator}>
						:
						</div>
					<SelectInput
						font="seven-segment"
						rows={2}
						value={String(value.startingAt.minute).padStart(2, '0')}
						options={[...Array(60).keys()].map(i => String(i).padStart(2, '0')).reverse()}
						onInput={minute => {
							onInput({
								...value,
								startingAt: {
									...value.startingAt,
									minute: parseInt(minute),
								},
							})
						}}
					/>
				</div>
			</div>
		</div>
	)
}


export default SunRiseInput
