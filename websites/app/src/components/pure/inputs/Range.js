import React, { useEffect } from 'react'
import { useSpring, animated, config } from 'react-spring'
import classNames from 'classnames'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../../hooks/use-dimensions'
import styles from './Range.css'

const Range = ({
	Icon,
	range,
	disabled: isDisabled,
	value,
	valueWithSource,
	onInput,
	vertical
}) => {
	const [ref, { width, height }] = useDimensions()

	const bindDrag = useDrag(({ delta }) => {
		const [deltaX, deltaY] = delta
		if (isDisabled) return
		if (!onInput) return

		let deltaValue
		if (vertical) {
			deltaValue = -1 * (deltaY / height) * (range.max - range.min)
			//            ^- because y-axis is flipped in html
		} else {
			deltaValue = (deltaX / width) * (range.max - range.min)
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
		vertical ?
			{ height: valueToPercentage(value, range) } :
			{ width: valueToPercentage(value, range) }
	))

	useEffect(() => {
		if (valueWithSource) return

		setFillStyle({
			to: vertical ?
				{ height: valueToPercentage(value, range) } :
				{ width: valueToPercentage(value, range) },
			config: config.stiff,
		})
	}, [value])

	useEffect(() => {
		if (!valueWithSource) return

		const { value, source } = valueWithSource
		const immediate = source === 'SELF'

		setFillStyle({
			to: vertical ?
				{ height: valueToPercentage(value, range) } :
				{ width: valueToPercentage(value, range) },
			config: immediate ? config.stiff : config.gentle,
		})
	}, [valueWithSource])

	return (
		<div
			{...bindDrag()}
			ref={ref}
			className={classNames({
				[styles.container]: true,
				[styles.container__horizontal]: !vertical,
				[styles.container__vertical]: vertical,
			})}
		>
			<animated.div
				style={fillStyle}
				className={classNames({
					[styles.fill]: true,
					[styles.fill__disabled]: isDisabled,
					[styles.fill__horizontal]: !vertical,
					[styles.fill__vertical]: vertical,
				})}
			></animated.div>
			<div
				className={classNames({
					[styles.icon]: true,
					[styles.icon__horizontal]: !vertical,
					[styles.icon__vertical]: vertical,
				})}
			>
				<Icon size={32} />
			</div>
		</div>
	)
}

export default Range
