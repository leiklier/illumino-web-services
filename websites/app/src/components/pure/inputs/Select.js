import React, { useState, useEffect, useMemo } from 'react'
import { useSpring, animated, config } from 'react-spring'
import {
	FaChevronLeft,
	FaChevronRight,
	FaChevronUp,
	FaChevronDown
} from 'react-icons/fa'
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
	valueWithSource,
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

			let index = Math.round(displayIndex)
			if (index < 0) index = 0
			if (index > options.length - 1) index = options.length - 1

			const nearestOption = options[index]
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
		return valueIndex + indexDiff
	}, [valueIndex, indexDiff, options])

	function handleSelectPrevious() {
		if (valueIndex === 0) return
		onInput(options[valueIndex - 1].value)
	}

	function handleSelectNext() {
		if (valueIndex === options.length - 1) return
		onInput(options[valueIndex + 1].value)
	}

	const arrowBackwardStyle = useSpring({
		color: `rgba(255, 255, 255, ${valueIndex !== 0 ? 0.7 : 0.25}`,
	})

	const arrowForwardStyle = useSpring({
		color: `rgba(255, 255, 255, ${valueIndex !== options.length - 1 ? 0.7 : 0.25}`,
	})

	const [optionsContainerStyle, setOptionsContainerStyle] = useSpring(() => ({
		to: isHorizontal ?
			{
				width: options.length * 100 + '%',
				left: -1 * displayIndex * 100 + '%',
			} : {
				height: options.length * 100 + '%',
				top: -1 * displayIndex * 100 + '%',
			},
		immediate: true,
	}))

	useEffect(() => {
		const immediate = valueIndex !== displayIndex
		setOptionsContainerStyle({
			to: isHorizontal ?
				{ left: -1 * displayIndex * 100 + '%' } :
				{ top: -1 * displayIndex * 100 + '%' },
			config: immediate ? config.stiff : config.gentle,
			immediate: false,
		})
	}, [displayIndex])

	useEffect(() => {
		setOptionsContainerStyle({
			to: isHorizontal ?
				{ width: options.length * 100 + '%' } :
				{ height: options.length * 100 + '%' },
			immediate: true,
		})
	}, [options])

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
			<animated.div
				style={arrowBackwardStyle}
				onClick={handleSelectPrevious}
				className={classNames({
					[styles.arrow]: true,
					[styles.arrow__medium]: size > 2,
					[styles.arrow__small]: size <= 2,
				})}
			>
				{
					isHorizontal ?
						<FaChevronLeft size={32} /> : <FaChevronUp size={32} />
				}
			</animated.div>
			<div
				ref={contentRef}
				className={classNames({
					[styles.content]: true,
					[styles.content__horizontal]: isHorizontal,
					[styles.content__vertical]: !isHorizontal,
				})}
			>
				{name ? <h2 className={styles.subHeader}>{name}</h2> : ''}
				<animated.div
					style={optionsContainerStyle}
					className={classNames({
						[styles.optionsContainer]: true,
						[styles.optionsContainer__horizontal]: isHorizontal,
						[styles.optionsContainer__vertical]: !isHorizontal,
					})}
				>
					{options.map(option =>
						<Option
							key={option.value}
							font={font}
							isHorizontal={isHorizontal}
							option={option}
						/>
					)}
				</animated.div>
			</div>
			<animated.div
				style={arrowForwardStyle}
				onClick={handleSelectNext}
				className={classNames({
					[styles.arrow]: true,
					[styles.arrow__medium]: size > 2,
					[styles.arrow__small]: size <= 2,
				})}
			>
				{
					isHorizontal ?
						<FaChevronRight size={32} /> : <FaChevronDown size={32} />
				}
			</animated.div>
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
