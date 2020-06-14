import React, { useState, useEffect } from 'react'
import { WiSunrise } from 'react-icons/wi'
import SelectInput from './Select'
import styles from './Sunrise.css'

const SunRiseInput = ({ value, onInput }) => {
	const hourOptions = [...Array(24).keys()].map(value => ({
		value: value + 1,
		name: String(value + 1).padStart(2, '0')
	})).reverse()

	const minuteOptions = [...Array(60).keys()].map(value => ({
		value,
		name: String(value).padStart(2, '0')
	})).reverse()

	return (
		<div className={styles.container}>
			<div className={styles.leftContainer}>
				<div className={styles.label}>Sunrise Morning</div>
				<div
					className={styles.buttonToggle}
					onClick={isActive => {
						onInput({
							...value,
							isActive,
						})
					}}
				>
					<WiSunrise size={40} />
				</div>
			</div>
			<div className={styles.clockContainer}>
				<div className={styles.clockInput}>
					<SelectInput
						font="seven-segment"
						value={value.startingAt.hour}
						options={hourOptions}
						onInput={hour => {
							onInput({
								...value,
								startingAt: {
									...value.startingAt,
									hour,
								},
							})
						}}
						vertical
					/>
				</div>
				<div className={styles.clockInputSeparator}>
					:
				</div>
				<div className={styles.clockInput}>
					<SelectInput
						font="seven-segment"
						value={value.startingAt.minute}
						options={minuteOptions}
						onInput={minute => {
							onInput({
								...value,
								startingAt: {
									...value.startingAt,
									minute,
								},
							})
						}}
						vertical
					/>
				</div>
			</div>
		</div>
	)
}


export default SunRiseInput
