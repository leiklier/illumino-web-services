import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../hooks/use-dimensions'
import styles from './Range.css'

const Range = ({
	rows,
	cols,
	icon,
	range,
	disabled: isDisabled,
	value: initialValue,
	onInput,
}) => {
	const isHorizontal = cols > rows
	const [timeoutId, setTimeoutId] = useState(null)
	const [value, setValue] = useState(initialValue)
	const [valueIsEmitted, setValueIsEmitted] = useState(true)
	const [percentage, setPercentage] = useState(
		(value / (range[1] - range[0])) * 100 + '%',
	)
	const [{ touchX, touchY }, setPosition] = useState({ touchX: 0, touchY: 0 })
	const bindDrag = useDrag(({ xy: [x, y] }) =>
		setPosition({ touchX: x, touchY: y }),
	)
	const [ref, { width, height, x: elemX, y: elemY }] = useDimensions()

	// Change value on touch
	if (isHorizontal) {
		useEffect(() => {
			if (!isDisabled) {
				const newValue = ((touchX - elemX) / width) * (range[1] - range[0])
				setValue(newValue)
				setValueIsEmitted(false)
			}
		}, [touchX])
	} else {
		useEffect(() => {
			if (!isDisabled) {
				const newValue = (1 - (touchY - elemY) / height) * (range[1] - range[0])
				setValue(newValue)
				setValueIsEmitted(false)
			}
		}, [touchY])
	}

	// Emit value when changing
	useEffect(() => {
		if (valueIsEmitted) return
		if (!onInput) return
		onInput(validateValue(value))
		setValueIsEmitted(true)
	}, [valueIsEmitted])

	// Update value when received from props
	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	// Update percentage when value changes
	useEffect(() => {
		setPercentage((value / (range[1] - range[0])) * 100 + '%')
	}, [value])

	function validateValue(value) {
		if (value > range[1]) return range[1]
		if (value < range[0]) return range[0]
		return value
	}

	return (
		<div
			{...bindDrag()}
			ref={ref}
			style={{
				gridColumnEnd: `span ${cols}`,
				gridRowEnd: `span ${rows}`,
			}}
			className={classNames({
				[styles.container]: true,
				[styles.containerIfHorizontal]: isHorizontal,
				[styles.containerIfVertical]: !isHorizontal,
			})}
		>
			<div
				style={isHorizontal ? { width: percentage } : { height: percentage }}
				className={classNames({
					[styles.fill]: true,
					[styles.fillIfHorizontal]: isHorizontal,
					[styles.fillIfVertical]: !isHorizontal,
					[styles.fillIfDisabled]: isDisabled,
				})}
			></div>
			<FontAwesomeIcon
				icon={icon}
				className={classNames({
					[styles.icon]: true,
					[styles.iconIfHorizontal]: isHorizontal,
					[styles.iconIfVertical]: !isHorizontal,
				})}
				size="2x"
			/>
		</div>
	)
}

export default Range
