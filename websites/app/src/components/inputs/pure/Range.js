import React, { useEffect } from 'react'
import { useSpring, animated, config } from 'react-spring'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../../hooks/use-dimensions'
import styles from './Range.css'

const Range = ({
	rows,
	cols,
	icon,
	range,
	disabled: isDisabled,
	value,
	valueWithSource,
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

	const [fillStyle, setFillStyle] = useSpring(() => (
		isHorizontal ?
			{ width: valueToPercentage(value, range) } :
			{ height: valueToPercentage(value, range) }
	))

	useEffect(() => {
		if (valueWithSource) return
		setFillStyle({
			to: isHorizontal ?
				{ width: valueToPercentage(value, range) } :
				{ height: valueToPercentage(value, range) },
			config: config.stiff,
		})
	}, [value])

	useEffect(() => {
		const { value, source } = valueWithSource
		const immediate = source === 'SELF'

		setFillStyle({
			to: isHorizontal ?
				{ width: valueToPercentage(value, range) } :
				{ height: valueToPercentage(value, range) },
			config: immediate ? config.stiff : config.gentle,
		})
	}, [valueWithSource])

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
			<animated.div
				style={fillStyle}
				className={classNames({
					[styles.fill]: true,
					[styles.fillIfHorizontal]: isHorizontal,
					[styles.fillIfVertical]: !isHorizontal,
					[styles.fillIfDisabled]: isDisabled,
				})}
			></animated.div>
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
