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
	value,
	options,
	onInput,
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
			if (indexDiff > 0.35) onInput && onInput(getPreviousOption())
			if (indexDiff < -0.35) onInput && onInput(getNextOption())
			setIndexDiff(0)
		}
	}, [isTouching])


	function getPreviousOption() {
		const indexOfValue = options.indexOf(value)
		if (indexOfValue === 0) return options[options.length - 1]
		return options[indexOfValue - 1]
	}

	function getNextOption() {
		const indexOfValue = options.indexOf(value)
		if (indexOfValue === options.length - 1) return options[0]
		return options[indexOfValue + 1]
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
				onClick={() => onInput && onInput(getPreviousOption())}
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
					<Option
						font={font}
						isHorizontal={isHorizontal}
						value={getPreviousOption()}
					/>
					<Option
						font={font}
						isHorizontal={isHorizontal}
						value={value}
					/>
					<Option
						font={font}
						isHorizontal={isHorizontal}
						value={getNextOption()}
					/>
				</div>
			</div>
			<div
				onClick={() => onInput && onInput(getNextOption())}
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

function Option({ font, isHorizontal, value }) {
	function formatValue(value) {
		const formatted =
			value.charAt(0).toUpperCase() +
			value
				.replace('_', ' ')
				.toLowerCase()
				.slice(1)
		return formatted
	}

	return (
		<div
			className={classNames({
				[styles.option]: true,
				[styles.option__horizontal]: isHorizontal,
				[styles.option__vertical]: !isHorizontal,
			})}
			style={font ? { fontFamily: font } : {}}
		>
			<span>{formatValue(value)}</span>
		</div>
	)
}

export default Select
