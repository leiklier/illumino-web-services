import React, { useState, useEffect, useMemo } from 'react'
import { useSpring, animated } from 'react-spring'
import useInterval from '../../../hooks/use-interval'
import useDimensions from '../../../hooks/use-dimensions'
import { WiSunset } from 'react-icons/wi'
import styles from './Sunset.css'

const SunsetInput = ({
	value,
	onInput,
}) => {
	const sunsetDuration_S = 5 * 60

	const [isActive, setIsActive] = useState(false)
	useEffect(() => {
		if (value.startedAt && value.endingAt)
			setIsActive(true)
		else
			setIsActive(false)
	}, [value])
	useInterval(() => {
		// Deactivate if we are ahead in time
		// of when the sunset should display:
		const endingAt_MS = new Date(value.endingAt).getTime()
		const timeRemaining_S = Math.ceil((endingAt_MS - Date.now()) / 1000)
		if (timeRemaining_S < 1) {
			setIsActive(false)
		}
	}, isActive ? 1000 : null)

	// Text to display
	const [timeRemainingText, setTimeRemainingText] = useState('')
	useInterval(() => {
		const endingAt_MS = new Date(value.endingAt).getTime()
		const timeRemaining_S = Math.ceil((endingAt_MS - Date.now()) / 1000)
		if (timeRemaining_S < 60) {
			setTimeRemainingText(timeRemaining_S + 's')
			return
		}

		const timeRemaining_M = Math.floor(timeRemaining_S / 60)
		setTimeRemainingText(timeRemaining_M + 'm')

	}, isActive ? 1000 : null)

	// Dynamic stylings
	function getClipPathStyle(progress) {
		// Max: 140; Min: 0
		const expansionProgress = (140 - 0) * (1 - progress) + 0
		// Max: 255; Min: 50
		const greenProgress = (255 - 50) * (1 - progress) + 50

		return {
			clipPath: `circle(${expansionProgress}% at 0% 100%)`,
			WebkitClipPath: `circle(${expansionProgress}% at 0% 100%)`,
			background: `rgba(255, ${greenProgress}, 75, 0.7)`,
		}
	}
	function getIconStyle(progress) {
		if (!isActive || !iconWrapperHeight || !iconHeight) {
			return { top: '0px' }
		}

		return {
			top: `${iconWrapperHeight / 2 - iconHeight / 2 + 'px'}`
		}
	}

	const [clipPathStyle, setClipPathStyle] = useSpring(() => getClipPathStyle(1))
	const [iconStyle, setIconStyle] = useSpring(() => getIconStyle(1))
	// Calculate style when active
	useInterval(() => {
		if (!value.startedAt || !value.endingAt)
			return

		const startedAt_MS = new Date(value.startedAt).getTime()
		const endingAt_MS = new Date(value.endingAt).getTime()
		const timeElapsed_MS = Date.now() - startedAt_MS
		let progress = timeElapsed_MS / (endingAt_MS - startedAt_MS)

		if (progress > 1) progress = 1
		if (progress < 0) progress = 0

		setClipPathStyle(getClipPathStyle(progress))
		setIconStyle(getIconStyle(progress))

	}, isActive ? 100 : null)
	// Reset when deactivated:
	useEffect(() => {
		if (isActive) return
		setClipPathStyle(getClipPathStyle(1))
		setIconStyle(getIconStyle(1))
	}, [isActive])

	function handleClick() {
		if (!onInput) return

		if (!isActive) {
			onInput({
				startedAt: new Date(Date.now()).toISOString(),
				endingAt: new Date(Date.now() + sunsetDuration_S * 1000).toISOString(),
			})
		} else {
			onInput({ startedAt: null, endingAt: null })
		}
	}

	const [iconRef, { height: iconHeight }] = useDimensions()
	const [iconWrapperRef, { height: iconWrapperHeight }] = useDimensions()

	return (
		<div className={styles.container} onClick={handleClick}>
			<animated.div style={clipPathStyle} className={styles.progress} />
			{isActive ? <div className={styles.text}>{timeRemainingText}</div> : ''}
			<div className={styles.iconContainer}>
				<div ref={iconWrapperRef} className={styles.iconWrapper}>
					<animated.div
						ref={iconRef}
						style={iconStyle}
						className={styles.icon}
					>
						<WiSunset size={48} />
					</animated.div>
				</div>
			</div>
		</div>
	)
}

export default SunsetInput
