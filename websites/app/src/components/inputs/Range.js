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
	value,
	onInput,
}) => {
	const isHorizontal = cols > rows
	const [ref, { width, height }] = useDimensions()

	const bindDrag = useDrag(({ delta }) => {
		const [deltaX, deltaY] = delta
		if (isDisabled) return
		if (!onInput) return



		let deltaValue
		if (isHorizontal) {
			deltaValue = (deltaX / width) * (range.max - range.min)
		} else { // is vertical
			deltaValue = -1 * (deltaY / height) * (range.max - range.min)
			//            ^- because y-axis is flipped in html
		}

		let newValue = value + deltaValue
		if (newValue > range.max) newValue = range.max
		if (newValue < range.min) newValue = range.min

		onInput(newValue)
	})

	function valueToPercentage(value, range) {
		return `${value / (range.max - range.min) * 100}%`
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
				style={isHorizontal ?
					{ width: valueToPercentage(value, range) } :
					{ height: valueToPercentage(value, range) }
				}
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
