import React from 'react'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import CircularButton from './CircularButton'
import styles from './SunRise.css'

const SunRiseInput = () => {
	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.name}>Sunrise Morning</div>
				<div className={styles.buttonToggle}>
					<CircularButton icon={faSun} value={true} type="ghost" iconColor="rgba(255, 255, 75, 0.7)" />
				</div>
			</div>
		</div>
	)
}

export default SunRiseInput
