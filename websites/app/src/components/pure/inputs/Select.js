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
	vertical,
	hideButtons,
	disableSwipe,
}) => {
	if (!onInput) onInput = () => { }

	const [ref, { width, height }] = useDimensions()

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
		if(disableSwipe) return

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
		if (vertical) {
			setIndexDiff(-1 * my / contentHeight)
			
		} else {
			setIndexDiff(- 1 * mx / contentWidth)
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
		to: vertical ?
		{
			height: options.length * 100 + '%',
			top: -1 * displayIndex * 100 + '%',
		} : {
			width: options.length * 100 + '%',
			left: -1 * displayIndex * 100 + '%',
		},
		immediate: true,
	}))

	useEffect(() => {
		const immediate = valueIndex !== displayIndex
		setOptionsContainerStyle({
			to: vertical ?
				{ top: -1 * displayIndex * 100 + '%' } :
				{ left: -1 * displayIndex * 100 + '%' },
			config: immediate ? config.stiff : config.default,
			immediate: false,
		})
	}, [displayIndex])

	useEffect(() => {
		setOptionsContainerStyle({
			to: vertical ?
				{ height: options.length * 100 + '%' } :
				{ width: options.length * 100 + '%' },
			immediate: true,
		})
	}, [options])

	return (
		<div
			ref={ref}
			{...bindDrag()}
			className={classNames({
				[styles.container]: true,
				[styles.container__horizontal]: !vertical,
				[styles.container__vertical]: vertical,
			})}
		>
			{!hideButtons ? 
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
						vertical ?
						<FaChevronUp size={32} /> : <FaChevronLeft size={32} />
					}
				</animated.div> : ''
			}
			<div
				ref={contentRef}
				className={classNames({
					[styles.content]: true,
					[styles.content__horizontal]: !vertical,
					[styles.content__vertical]: vertical,
				})}
			>
				{label ? <div className={styles.label}>{label}</div> : ''}
				<animated.div
					style={{
						...optionsContainerStyle,
						fontSize: font==='seven-segment' ? '2rem' : '1.5rem',
					}}
					className={classNames({
						[styles.optionsContainer]: true,
						[styles.optionsContainer__horizontal]: !vertical,
						[styles.optionsContainer__vertical]: vertical,
					})}
				>
					{options.map(option =>
						<Option
							key={option.value}
							font={font}
							vertical={vertical}
							centered={!vertical && !label}
							option={option}
						/>
					)}
				</animated.div>
			</div>
			{!hideButtons ?
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
						vertical ?
							<FaChevronDown size={32} /> : <FaChevronRight size={32} /> 
					}
				</animated.div> : ''
			}
		</div >
	)
}

function Option({ centered, font, vertical, option}) {
	return (
		<div
			className={classNames({
				[styles.option]: true,
				[styles.option__horizontal]: !vertical,
				[styles.option__vertical]: vertical,
			})}
			style={{
				fontFamily: font ? font : undefined,
				justifyContent: centered ? 'center' : 'flex-start'
			}}
		>
			<span>{option.name}</span>
		</div>
	)
}

export default Select
