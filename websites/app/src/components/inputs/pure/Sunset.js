import React, { useState, useEffect } from 'react'
import useInterval from '../../../hooks/use-interval'
import useDimensions from '../../../hooks/use-dimensions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import styles from './Sunset.css'

const SunsetInput = ({
	startedAt: initialStartedAt,
	endingAt: initialEndingAt,
	duration: SUNSET_DURATION_S,
	onClick,
}) => {
	const PROGRESS_TRANSITION_TIME_MS = 500
	const PROGRESS_MAX_EXPANSION = 140
	const PROGRESS_MIN_EXPANSION = 0

	const [tick, setTick] = useState(false)
	const [isActivated, setIsActivated] = useState(
		initialStartedAt && initialEndingAt,
	)
	const [startedAt, setStartedAt] = useState(initialStartedAt)
	const [endingAt, setEndingAt] = useState(initialEndingAt)
	const [timeLeft, setTimeLeft] = useState('')

	const [iconRef, { width: iconWidth, height: iconHeight }] = useDimensions()
	const [
		iconWrapperRef,
		{ width: iconWrapperWidth, height: iconWrapperHeight },
	] = useDimensions()

	const [progressStyle, setProgressStyle] = useState({})
	const [iconStyle, setIconStyle] = useState({})

	// Tick
	useInterval(() => {
		setTick(!tick)
	}, 10)

	// Emit the onClick event:
	useEffect(() => {
		if (!onClick) return
		onClick({ startedAt, endingAt })
	}, [startedAt])

	// Listen for receiving 'startedAt' and 'endingAt' via props
	useEffect(() => {
		setStartedAt(initialStartedAt)
		setEndingAt(initialEndingAt)

		if (initialStartedAt && initialEndingAt) setIsActivated(true)
		else setIsActivated(false)
	}, [initialStartedAt, initialEndingAt])

	// Deactivate when timer has finished
	useEffect(() => {
		const endingAtMs = new Date(endingAt).getTime()
		const timeRemaining = endingAtMs - Date.now()
		if (timeRemaining <= 0) setIsActivated(false)
	}, [tick])

	// Calculate time remaining
	useEffect(() => {
		if (isActivated) {
			const endingAtMs = new Date(endingAt).getTime()
			const diffInSeconds = Math.ceil((endingAtMs - Date.now()) / 1000)
			if (diffInSeconds > 60) {
				const diffInMinutes = Math.floor(diffInSeconds / 60)
				setTimeLeft(diffInMinutes + 'm')
			} else {
				setTimeLeft(diffInSeconds + 's')
			}
		} else {
			setTimeLeft('')
		}
	}, [tick])

	// Collapse / expand progress indicator on click
	useEffect(() => {
		let newProgressStyle = {
			clipPath: 'circle(0% at 0% 100%)',
			WebkitClipPath: 'circle(0% at 0% 100%)',
			transitionTimingFunction: 'ease-in-out',
			transitionDuration: `${PROGRESS_TRANSITION_TIME_MS}ms`,
		}

		if (isActivated)
			newProgressStyle = {
				...newProgressStyle,
				clipPath: 'circle(140% at 0% 100%)',
				WebkitClipPath: 'circle(140% at 0% 100%)',
			}

		setProgressStyle(newProgressStyle)
	}, [isActivated])

	// Calculate progress
	useEffect(() => {
		// prettier-ignore
		//                                                     ,--- Progress starts after transition
		const startedAtMs = new Date(startedAt).getTime() + PROGRESS_TRANSITION_TIME_MS
		const endingAtMs = new Date(endingAt).getTime()
		const timeElapsedMs = Date.now() - startedAtMs

		const progress = timeElapsedMs / (endingAtMs - startedAtMs)
		const progressExpansion =
			(PROGRESS_MAX_EXPANSION - PROGRESS_MIN_EXPANSION) * (1 - progress) +
			PROGRESS_MIN_EXPANSION

		const green = (255 - 50) * (1 - progress) + 50

		if (!isActivated || !startedAt || !endingAt) return
		if (timeElapsedMs < 0) return

		setProgressStyle({
			clipPath: `circle(${progressExpansion}% at 0% 100%)`,
			WebkitClipPath: `circle(${progressExpansion}% at 0% 100%)`,
			background: `rgba(255, ${green}, 75, 0.7)`,
		})
	}, [tick, startedAt, endingAt])

	// Move icon when activating / deactivating
	useEffect(() => {
		let newIconStyle = {
			position: 'absolute',
			left: iconWrapperWidth / 2 - iconWidth / 2 + 'px',
			bottom: iconWrapperHeight / 2 - iconHeight / 2 + 'px',
		}
		if (isActivated) {
			newIconStyle = {
				...newIconStyle,
				bottom: 0,
				padding: '0 0.5rem',
			}
		}
		setIconStyle(newIconStyle)
	}, [isActivated, iconWidth, iconHeight, iconWrapperWidth, iconWrapperHeight])

	// Set startedAt and endingAt when activating, and also reset
	function handleClick() {
		if (!isActivated) {
			setStartedAt(new Date(Date.now()).toISOString())
			setEndingAt(new Date(Date.now() + SUNSET_DURATION_S * 1000).toISOString())
		} else {
			setStartedAt(null)
			setEndingAt(null)
		}
		setIsActivated(!isActivated)
	}

	return (
		<div className={styles.container} onClick={handleClick}>
			<div style={progressStyle} className={styles.progress} />
			{isActivated ? <div className={styles.text}>{timeLeft}</div> : ''}
			<div className={styles.iconContainer}>
				<div ref={iconWrapperRef} className={styles.iconWrapper}>
					<div ref={iconRef} style={iconStyle} className={styles.icon}>
						<FontAwesomeIcon icon={faSun} size="2x" />
					</div>
				</div>
			</div>
		</div>
	)
}

export default SunsetInput
