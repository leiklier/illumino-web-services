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
	label,
	font,
	value, // Corresponds to the value property of an option
	valueWithSource,
	options, // [{ value: any, name: String }]
	onInput,
}) => {
	if (!onInput) onInput = () => { }

	const [ref, { width, height }] = useDimensions()
	const isHorizontal = useMemo(() => {
		if(!width || !height) return true
		return width > height
	}, [width, height])

	const size = useMemo(() => {
		if(!width || !height) 'lg'
		const length = width > height ? width : height
		
		if(length < 70)
			return 'sm'
		else if(length < 140)
			return 'md'
		else
			return 'lg'
	}, [width, height])

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
		setOptionsContainerStyle({
			to: isHorizontal ?
			{
				height: '100%',
				top: '0%',
			} :
			{
				width: '100%',
				left: '0%',
			},
			immediate: true,
		})
	}, [isHorizontal])

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
			ref={ref}
			{...bindDrag()}
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
					[styles.arrow__medium]: size === 'lg',
					[styles.arrow__small]: size !==  'lg',
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
				{label ? <div className={styles.label}>{label}</div> : ''}
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
					[styles.arrow__medium]: size === 'lg',
					[styles.arrow__small]: size !==  'lg',
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
