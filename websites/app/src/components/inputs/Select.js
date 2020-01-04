import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../hooks/use-dimensions'
import styles from './Select.css'

const Select = ({
	cols,
	name,
	selected: initialSelected,
	options,
	onSelect,
}) => {
	const [selected, setSelected] = useState(initialSelected)
	const [indexDiff, setIndexDiff] = useState(0)
	const [ref, { width }] = useDimensions()
	const [isTouching, setIsTouching] = useState(false)
	const [dragX, setDrag] = useState(0)
	const bindDrag = useDrag(({ down, movement: [mx, my] }) => {
		setDrag(mx)
		setIsTouching(down)
	})

	// Enable drag through carousel
	useEffect(() => {
		if (isTouching) setIndexDiff(dragX / width)
	}, [dragX])

	// Finish drag when over halfway and releasing
	useEffect(() => {
		if (!isTouching) {
			if (indexDiff > 0.35) setSelected(getPreviousSelected())
			if (indexDiff < -0.35) setSelected(getNextSelected())
			setIndexDiff(0)
		}
	}, [isTouching])

	// Emit change in selected
	useEffect(() => {
		if (!onSelect) return
		onSelect(selected)
	}, [selected])

	function getPreviousSelected() {
		const indexOfSelected = options.indexOf(selected)
		if (indexOfSelected === 0) return options[options.length - 1]
		return options[indexOfSelected - 1]
	}

	function getNextSelected() {
		const indexOfSelected = options.indexOf(selected)
		if (indexOfSelected === options.length - 1) return options[0]
		return options[indexOfSelected + 1]
	}

	function formatSelected(selected) {
		const formatted =
			selected.charAt(0).toUpperCase() +
			selected
				.replace('_', ' ')
				.toLowerCase()
				.slice(1)
		return formatted
	}

	return (
		<div
			{...bindDrag()}
			style={{ gridColumnEnd: `span ${cols}` }}
			className={styles.container}
		>
			<div
				onClick={() => setSelected(getPreviousSelected())}
				className={styles.arrow}
			>
				<FontAwesomeIcon icon={faChevronLeft} size="2x" />
			</div>
			<div ref={ref} className={styles.content}>
				<h2 className={styles.subHeader}>{name}</h2>
				<div
					style={{ left: (indexDiff - 1) * 100 + '%' }}
					className={styles.selectedContainer}
				>
					<div className={styles.selected}>
						{formatSelected(getPreviousSelected())}
					</div>
					<div className={styles.selected}>{formatSelected(selected)}</div>
					<div className={styles.selected}>
						{formatSelected(getNextSelected())}
					</div>
				</div>
			</div>
			<div
				onClick={() => setSelected(getNextSelected())}
				className={styles.arrow}
			>
				<FontAwesomeIcon icon={faChevronRight} size="2x" />
			</div>
		</div>
	)
}

export default Select
