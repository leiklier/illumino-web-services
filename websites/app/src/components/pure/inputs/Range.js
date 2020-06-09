import React, { useEffect, useMemo } from 'react'
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
}) => {
	const [ref, { width, height }] = useDimensions()
	const isHorizontal = useMemo(() => {
		if(!width || !height) return true
		return width > height
	}, [width, height])

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
		setFillStyle({
			to: isHorizontal ?
				{ height: '100%' } :
				{ width: '100%' },
			immediate: true,
		})
	}, [isHorizontal])

	useEffect(() => {
		if (valueWithSource) return

		setFillStyle({
			to: isHorizontal ?
				{ width: valueToPercentage(value, range) } :
				{ height: valueToPercentage(value, range) },
			config: config.stiff,
			immediate: false,
		})
	}, [value])

	useEffect(() => {
		if (!valueWithSource) return

		const { value, source } = valueWithSource
		const immediate = source === 'SELF'

		setFillStyle({
			to: isHorizontal ?
				{ width: valueToPercentage(value, range) } :
				{ height: valueToPercentage(value, range) },
			config: immediate ? config.stiff : config.gentle,
			immediate: false,
		})
	}, [valueWithSource])

	return (
		<div
			{...bindDrag()}
			ref={ref}
			className={classNames({
				[styles.container]: true,
				[styles.container__horizontal]: isHorizontal,
				[styles.container__vertical]: !isHorizontal,
			})}
		>
			<animated.div
				style={fillStyle}
				className={classNames({
					[styles.fill]: true,
					[styles.fill__disabled]: isDisabled,
					[styles.fill__horizontal]: isHorizontal,
					[styles.fill__vertical]: !isHorizontal,
				})}
			></animated.div>
			<div
				className={classNames({
					[styles.icon]: true,
					[styles.icon__horizontal]: isHorizontal,
					[styles.icon__vertical]: !isHorizontal,
				})}
			>
				<Icon size={32} />
			</div>
		</div>
	)
}

export default Range
