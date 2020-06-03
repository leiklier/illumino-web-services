import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChevronLeft,
	faChevronRight,
	faChevronUp,
	faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../../hooks/use-dimensions'
import classNames from 'classnames'
import styles from './Select.css'


const Select = ({
	rows,
	cols,
	name,
	font,
	selected,
	options,
	onSelect,
}) => {
	const isHorizontal = Boolean(cols)
	const size = isHorizontal ? cols : rows

	const [indexDiff, setIndexDiff] = useState(0)
	const [ref, { width, height }] = useDimensions()
	const [isTouching, setIsTouching] = useState(false)
	const [drag, setDrag] = useState(0)

	const bindDrag = useDrag(({ down, movement: [mx, my] }) => {
		if (isHorizontal) {
			setDrag(mx)
		} else {
			setDrag(my)
		}

		setIsTouching(down)
	})

	// Enable drag through carousel
	useEffect(() => {
		if (!isTouching) return

		if (isHorizontal) {
			setIndexDiff(drag / width)
		} else {
			setIndexDiff(drag / height)
		}
	}, [drag])

	// Finish drag when over halfway and releasing
	useEffect(() => {
		if (!isTouching) {
			if (indexDiff > 0.35) onSelect && onSelect(getPreviousSelected())
			if (indexDiff < -0.35) onSelect && onSelect(getNextSelected())
			setIndexDiff(0)
		}
	}, [isTouching])


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

	return (
		<div
			{...bindDrag()}
			style={
				isHorizontal ?
					{ gridColumnEnd: `span ${cols}` } :
					{ gridRowEnd: `span ${rows}` }
			}
			className={classNames({
				[styles.container]: true,
				[styles.container__horizontal]: isHorizontal,
				[styles.container__vertical]: !isHorizontal,
			})}
		>
			<div
				onClick={() => onSelect && onSelect(getPreviousSelected())}
				className={classNames({
					[styles.arrow]: true,
					[styles.arrow__medium]: size > 2,
					[styles.arrow__small]: size <= 2,
				})}
			>
				<FontAwesomeIcon
					icon={isHorizontal ? faChevronLeft : faChevronUp}
					size="2x"
				/>
			</div>
			<div
				ref={ref}
				className={classNames({
					[styles.content]: true,
					[styles.content__horizontal]: isHorizontal,
					[styles.content__vertical]: !isHorizontal,
				})}
			>
				{name ? <h2 className={styles.subHeader}>{name}</h2> : ''}
				<div
					style={{
						left: isHorizontal ? (indexDiff - 1) * 100 + '%' : '',
						top: !isHorizontal ? + (indexDiff - 1) * 100 + '%' : '',
					}}
					className={classNames({
						[styles.selectedContainer]: true,
						[styles.selectedContainer__horizontal]: isHorizontal,
						[styles.selectedContainer__vertical]: !isHorizontal,
					})}
				>
					<Selected
						font={font}
						isHorizontal={isHorizontal}
						selected={getPreviousSelected()}
					/>
					<Selected
						font={font}
						isHorizontal={isHorizontal}
						selected={selected}
					/>
					<Selected
						font={font}
						isHorizontal={isHorizontal}
						selected={getNextSelected()}
					/>
				</div>
			</div>
			<div
				onClick={() => onSelect && onSelect(getNextSelected())}
				className={classNames({
					[styles.arrow]: true,
					[styles.arrow__medium]: size > 2,
					[styles.arrow__small]: size <= 2,
				})}
			>
				<FontAwesomeIcon
					icon={isHorizontal ? faChevronRight : faChevronDown}
					size="2x"
				/>
			</div>
		</div >
	)
}

function Selected({ font, isHorizontal, selected }) {
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
			className={classNames({
				[styles.selected]: true,
				[styles.selected__horizontal]: isHorizontal,
				[styles.selected__vertical]: !isHorizontal,
			})}
			style={font ? { fontFamily: font } : {}}
		>
			<span>{formatSelected(selected)}</span>
		</div>
	)
}

export default Select
