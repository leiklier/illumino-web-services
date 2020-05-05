import React from 'react'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import CircularButton from './CircularButton'
import SelectInput from './Select'
import styles from './SunRise.css'

const SunRiseInput = () => {
	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.name}>Sunrise Morning</div>
				<div className={styles.buttonToggle}>
					<CircularButton icon={faSun} value={true} type="ghost" iconColor="rgba(255, 255, 75, 0.7)" />
				</div>
				<div className={styles.clockInputContainer}>
					<SelectInput
						font="seven-segment"
						rows={2}
						selected="22"
						options={[...Array(24).keys()].map(i => String(i + 1).padStart(2, '0')).reverse()}
					/>
					<div className={styles.clockInputSeparator}>
						:
					</div>
					<SelectInput
						font="seven-segment"
						rows={2}
						selected="20"
						options={[...Array(60).keys()].map(i => String(i).padStart(2, '0')).reverse()}
					/>
				</div>
			</div>
		</div>
	)
}

export default SunRiseInput
