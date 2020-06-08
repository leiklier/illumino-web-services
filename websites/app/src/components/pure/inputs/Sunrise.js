import React, { useState, useEffect } from 'react'
import { WiSunrise } from 'react-icons/wi'
import CircularButton from './CircularButton'
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
			<div className={styles.wrapper}>
				<div className={styles.name}>Sunrise Morning</div>
				<div className={styles.buttonToggle}>
					<CircularButton
						Icon={WiSunrise}
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
					/>
					<div className={styles.clockInputSeparator}>
						:
						</div>
					<SelectInput
						font="seven-segment"
						rows={2}
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
					/>
				</div>
			</div>
		</div>
	)
}


export default SunRiseInput
