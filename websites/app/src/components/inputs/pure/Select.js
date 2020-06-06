import React, { useState, useEffect, useMemo } from 'react'
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
import lodash from 'lodash'


const Select = ({
	rows,
	cols,
	name,
	font,
	value, // Corresponds to the value property of an option
	options, // [{ value: any, name: String }]
	onInput,
}) => {
	if (!onInput) onInput = () => { }

	const isHorizontal = Boolean(cols)
	const size = isHorizontal ? cols : rows

	const valueIndex = useMemo(() => {
		return options.findIndex(option => lodash.isEqual(option.value, value))
	}, [value, options])

	const [indexDiff, setIndexDiff] = useState(0)
	const [contentRef, { width: contentWidth, height: contentHeight }] = useDimensions()

	const bindDrag = useDrag(({ down: isTouching, movement: [mx, my] }) => {
		if (!isTouching) {
			if (!indexDiff) return

			const nearestOption = options[Math.round(displayIndex) % options.length]
			onInput(nearestOption.value)

			setIndexDiff(0)
			return
		}
		if (isHorizontal) {
			setIndexDiff(- 1 * mx / contentWidth)
		} else {
			setIndexDiff(-1 * my / contentHeight)
		}
	})

	const displayIndex = useMemo(() => {
		let index = valueIndex + indexDiff

		if (index < -0.5) index += options.length
		index = index % options.length

		return index
	}, [valueIndex, indexDiff, options])

	function handleSelectPrevious() {
		if (valueIndex === 0) {
			onInput(options[options.length - 1].value)
			return
		}
		onInput(options[valueIndex - 1].value)
	}

	function handleSelectNext() {
		if (valueIndex === options.length - 1) {
			onInput(options[0].value)
			return
		}
		onInput(options[valueIndex + 1].value)
	}

	const optionsContainerStyle = useMemo(() => {
		return isHorizontal ?
			{
				//                       	 since we fill with
				//                       ,-- options at start and end
				width: (options.length + 2) * 100 + '%',
				//               				to account for option
				//                         ,--  fill at start
				left: -1 * (displayIndex + 1) * 100 + '%',
			} : {
				height: (options.length + 2) * 100 + '%',
				top: -1 * (displayIndex + 1) * 100 + '%',
			}
	}, [isHorizontal, options, displayIndex])

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
				onClick={handleSelectPrevious}
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
				ref={contentRef}
				className={classNames({
					[styles.content]: true,
					[styles.content__horizontal]: isHorizontal,
					[styles.content__vertical]: !isHorizontal,
				})}
			>
				{name ? <h2 className={styles.subHeader}>{name}</h2> : ''}
				<div
					style={optionsContainerStyle}
					className={classNames({
						[styles.optionsContainer]: true,
						[styles.optionsContainer__horizontal]: isHorizontal,
						[styles.optionsContainer__vertical]: !isHorizontal,
					})}
				>
					<Option
						key={options[options.length - 1].value + 'S'}
						font={font}
						isHorizontal={isHorizontal}
						option={options[options.length - 1]}
					/>
					{options.map(option =>
						<Option
							key={option.value}
							font={font}
							isHorizontal={isHorizontal}
							option={option}
						/>
					)}
					<Option
						key={options[0].value + 'E'}
						font={font}
						isHorizontal={isHorizontal}
						option={options[0]}
					/>

				</div>
			</div>
			<div
				onClick={handleSelectNext}
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

function Option({ font, isHorizontal, option }) {
	return (
		<div
			className={classNames({
				[styles.option]: true,
				[styles.option__horizontal]: isHorizontal,
				[styles.option__vertical]: !isHorizontal,
			})}
			style={font ? { fontFamily: font } : {}}
		>
			<span>{option.name}</span>
		</div>
	)
}

export default Select
