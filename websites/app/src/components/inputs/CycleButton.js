import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import styles from './CycleButton.css'

const CycleButton = ({
	selected,
	allAreSelected: initialAllAreSelected,
	options,
	onSelect,
	onSelectAll,
	children,
}) => {
	const [allAreSelected, setAllAreSelected] = useState(initialAllAreSelected)
	const [isTouching, setIsTouching] = useState(false)
	const [touchStartedAtMs, setTouchStartedAtMs] = useState(null)
	const [overlayTimeoutId, setOverlayTimeoutId] = useState(null)
	const [selectAllTimeoutId, setSelectAllTimeoutId] = useState(null)
	const [overlayStyle, setOverlayStyle] = useState({})

	// Emit 'onSelectAll' event
	useEffect(() => {
		if (!onSelectAll) return
		onSelectAll(allAreSelected)
	}, [allAreSelected])

	// Update state when received from props
	useEffect(() => {
		setAllAreSelected(initialAllAreSelected)
	}, [initialAllAreSelected])

	// Set 'allAreSelected' after touchEvent has lasted 0.5s
	useEffect(() => {
		if (isTouching) {
			const timeoutId = setTimeout(() => setAllAreSelected(true), 500)
			setSelectAllTimeoutId(timeoutId)
		} else if (selectAllTimeoutId) {
			clearTimeout(selectAllTimeoutId)
			setSelectAllTimeoutId(null)
		}
	}, [isTouching])

	// Store time since touch started
	useEffect(() => {
		if (isTouching) setTouchStartedAtMs(Date.now())
		else setTouchStartedAtMs(null)
	}, [isTouching])

	// Move the overlay when receiving `allAreSelected` from props:
	useEffect(() => {
		if (initialAllAreSelected) {
			setOverlayStyle({
				clipPath: 'circle(140% at 100% 100%)',
				WebkitClipPath: 'circle(1400% at 100% 100%)',
				transitionTimingFunction: 'ease-out',
			})
		} else {
			setOverlayStyle({
				clipPath: 'circle(0% at 100% 100%)',
				WebkitClipPath: 'circle(0% at 100% 100%)',
				transitionTimingFunction: 'ease-out',
			})
		}
	}, [initialAllAreSelected])

	// Start by moving overlay halfway when touch has started
	useEffect(() => {
		if (isTouching && !allAreSelected) {
			setOverlayStyle({
				clipPath: 'circle(80% at 100% 100%)',
				WebkitClipPath: 'circle(80% at 100% 100%)',
			})
		} else if (!allAreSelected) {
			setOverlayStyle({
				clipPath: 'circle(0% at 100% 100%)',
				WebkitClipPath: 'circle(0% at 100% 100%)',
			})
		}
	}, [isTouching])

	// Move the rest of the overlay after touchEvent has lasted 0.5s:
	useEffect(() => {
		if (isTouching) {
			const timeoutId = setTimeout(
				() =>
					setOverlayStyle({
						clipPath: 'circle(140% at 100% 100%)',
						WebkitClipPath: 'circle(140% at 100% 100%)',
						transitionTimingFunction: 'ease-out',
					}),
				500,
			)
			setOverlayTimeoutId(timeoutId)
		} else if (overlayTimeoutId) {
			clearTimeout(overlayTimeoutId)
			setOverlayTimeoutId(null)
		}
	}, [isTouching])

	function onClick() {
		if (!onSelect) return
		if (allAreSelected) {
			setAllAreSelected(false)
			setOverlayStyle({
				clipPath: 'circle(0% at 100% 100%)',
				WebkitClipPath: 'circle(0% at 100% 100%)',
			})
			return
		}

		if (touchStartedAtMs && Date.now() - touchStartedAtMs >= 500) return

		const indexOfSelected = options.indexOf(selected)
		if (indexOfSelected >= options.length - 1) {
			onSelect(options[0])
			return
		}

		onSelect(options[indexOfSelected + 1])
	}

	return (
		<div
			className={styles.container}
			onClick={onClick}
			onTouchStart={() => setIsTouching(true)}
			onTouchEnd={() => setIsTouching(false)}
		>
			<div className={styles.wrapper}>
				<div className={styles.selected}>
					{typeof selected === 'number' ? '#' : ''}
					{selected}
				</div>
				<h1 className={styles.header}>
					{children}
					{allAreSelected ? 's' : ''}
				</h1>
			</div>

			<div
				style={overlayStyle}
				className={classNames({
					[styles.wrapper]: true,
					[styles.wrapperOverlay]: true,
				})}
			>
				<div
					className={classNames({
						[styles.selected]: true,
						[styles.selectedOverlay]: true,
					})}
				>
					All
				</div>
				<h1
					className={classNames({
						[styles.header]: true,
						[styles.headerOverlay]: true,
					})}
				>
					{children}
					{allAreSelected ? 's' : ''}
				</h1>
			</div>
		</div>
	)
}

export default CycleButton
