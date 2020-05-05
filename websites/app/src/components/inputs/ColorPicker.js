import React, { useState, useEffect } from 'react'
import styles from './ColorPicker.css'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../hooks/use-dimensions'

const ColorPicker = ({ value: { saturation: initialSaturation, hue: initialHue }, onChange }) => {
	const [saturation, setSaturation] = useState(initialSaturation || 0)
	const [hue, setHue] = useState(initialHue || 0)

	useEffect(() => {
		if (!onChange) return
		onChange({ saturation, hue })
	}, [hue, saturation])

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<ColorWheel
					innerCircleComponent={
						<ScrollWheel
							value={saturation}
							onChange={newValue => setSaturation(newValue)}
						/>
					}
					bottomSectionComponent={
						<ValueDisplay
							saturation={saturation}
							hue={hue}
						/>
					}
					value={hue}
					onChange={newValue => setHue(newValue)}
				/>
			</div>
		</div>
	)
}

function ColorWheel({
	innerCircleComponent,
	bottomSectionComponent,
	value: initialValue,
	onChange
}) {
	// Calculate dimensions of the horse shoe:
	const svg = {
		width: 100,
		height: 100,
	}
	const angle = Math.PI / 2
	const innerRadius = (svg.width / 2) * 0.55

	const outer = {
		startX: (svg.width / 2) * (1 + Math.cos((Math.PI - angle) / 2)),
		startY: (svg.height / 2) * (1 + Math.sin((Math.PI - angle) / 2)),
		endX: svg.width - (svg.width / 2) * (1 + Math.cos((Math.PI - angle) / 2)),
		endY: (svg.height / 2) * (1 + Math.sin((Math.PI - angle) / 2)),
	}

	const inner = {
		startX: svg.width / 2 - innerRadius * Math.cos((Math.PI - angle) / 2),
		startY: svg.height / 2 + innerRadius * Math.sin((Math.PI - angle) / 2),
		endX: svg.width / 2 + innerRadius * Math.cos((Math.PI - angle) / 2),
		endY: svg.height / 2 + innerRadius * Math.sin((Math.PI - angle) / 2),
	}

	// Enable dragging of the wheel:
	const [rotationCW, setRotationCW] = useState(hueToRadians(initialValue))
	const [ref, { y: top, x: left, width, height }] = useDimensions()

	const bindDrag = useDrag(({ previous: [x0, y0], xy: [x, y] }) => {
		if (!isTouching) return

		const angleOffsetCW = getAngleOffset(x0, y0, x, y, top, left, width, height)

		// 											   ,-- Restrict to [-2*PI, 2*PI]
		let newAngleCW = (rotationCW + angleOffsetCW) % (2 * Math.PI)

		if (newAngleCW < 0) {
			newAngleCW += 2 * Math.PI
		}

		setRotationCW(newAngleCW)
	})

	const [isTouching, setIsTouching] = useState(false)

	// Input logic
	useEffect(() => {
		if (!onChange) return
		onChange(radiansToHue(rotationCW))
	}, [rotationCW])

	return (
		<div className={styles.colorWheelContainer} {...bindDrag()} ref={ref}>
			<div className={styles.colorWheelInnerCircleContainer}>
				<div
					className={styles.colorWheelInnerCircleWrapper}
					style={{ minWidth: `${0.5 * width}px`, minHeight: `${0.5 * height}px` }}
				>
					{innerCircleComponent}
				</div>
			</div>
			<div className={styles.colorWheelBottomSectionContainer}>
				<div className={styles.colorWheelBottomSectionWrapper}>
					{bottomSectionComponent}
				</div>
			</div>
			<svg
				viewBox={`0 0 ${svg.width} ${svg.height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<pattern
						id="colorWheel"
						patternUnits="userSpaceOnUse"
						width="100"
						height="100"
					>
						<image
							xlinkHref="/images/color-wheel.png"
							x="0"
							y="0"
							transform={`rotate(${-1 * rotationCW / (2 * Math.PI) * 365} 50 50)`}
							width="100"
							height="100"
						/>
					</pattern>
				</defs>
				<path
					d={`
					M ${outer.startX} ${outer.startY}
					A ${svg.width / 2} ${svg.height / 2}, 0, 1 0, ${outer.endX} ${outer.endY}
					A 1 1, 0, 0 0, ${inner.startX} ${inner.startY}
					A ${innerRadius} ${innerRadius}, 0, 1 1, ${inner.endX} ${inner.endY}
					A 1 1, 0, 0 0, ${outer.startX} ${outer.startY}
					Z
				`}
					fill="url(#colorWheel)"
					fillOpacity={0.7}
					onTouchStart={() => setIsTouching(true)}
					onTouchEnd={() => setIsTouching(false)}
					onTouchCancel={() => setIsTouching(false)}
				/>
				<line
					x1={Math.round(svg.width / 2)}
					y1={Math.round(svg.height / 2 - innerRadius)}

					x2={Math.round(svg.width / 2)}
					y2={0}

					style={{
						stroke: 'rgb(255,255,255, 0.4)',
						strokeWidth: 3,
					}}
				/>
			</svg>
		</div>
	)
}

function ScrollWheel({ value: initialValue, onChange }) {
	// Input
	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		if (!onChange) return
		onChange(value)
	}, [value])

	// Scrolling logic
	const [ref, { y: top, x: left, height }] = useDimensions()

	const bindDrag = useDrag(({ previous: [x0, y0], xy: [x, y] }) => {
		const relativeDistance = (y0 - y) / height
		let newValue = value + relativeDistance / 3
		if (newValue > 1) newValue = 1
		if (newValue < 0) newValue = 0
		setValue(newValue)
	})

	const [offset, setOffset] = useState((150 * value) % 25)
	useEffect(() => {
		setOffset((150 * value) % 25)
	}, [value])

	return (
		<svg
			className={styles.scrollWheel}
			viewBox="0 0 100 100"
			ref={ref}
			{...bindDrag()}
		>
			<ScrollLine yStart={25} yOffset={-offset} />
			<ScrollLine yStart={50} yOffset={-offset} />
			<ScrollLine yStart={75} yOffset={-offset} />
			<ScrollLine yStart={100} yOffset={-offset} />
		</svg>
	)
}


function ScrollLine({ yStart, yOffset }) {
	const [state, setState] = useState({
		yPosition: yStart + yOffset,
		scalingFactor: getScalingFactor(yStart + yOffset),
	})
	useEffect(() => {
		setState({
			yPosition: yStart + yOffset,
			scalingFactor: getScalingFactor(yStart + yOffset),
		})
	}, [yOffset])

	function getScalingFactor(yPosition) {
		const yCenter = 50
		const distanceFromYCenter = Math.abs(yPosition - yCenter)
		const scalingFactor = 1 - distanceFromYCenter / yCenter
		return scalingFactor
	}

	return (
		<line
			x1={50 - 30 * state.scalingFactor}
			y1={state.yPosition}

			x2={50 + 30 * state.scalingFactor}
			y2={state.yPosition}

			style={{
				stroke: `rgb(255,255,255, ${0.7 * state.scalingFactor + 0.2})`,
				strokeWidth: 7 * state.scalingFactor + 2,
				strokeLinecap: 'round',
			}}
		/>
	)
}

function ValueDisplay({ saturation, hue }) {
	const [timeoutId, setTimeoutId] = useState(null)

	// Display Hue value after it has changed
	useEffect(() => {
		if (typeShowing === 'hue') return
		setTypeShowing('hue')

		// Reset back to saturation after 1500ms:
		window.clearTimeout(timeoutId)
		setTimeoutId(window.setTimeout(function () {
			setTypeShowing('saturation')
		}, 1500))
	}, [hue])

	useEffect(() => {
		if (typeShowing === 'saturation') return
		setTypeShowing('saturation')
	}, [saturation])

	const [typeShowing, setTypeShowing] = useState('saturation')
	return (
		<div className={styles.valueDisplayContainer}>
			<div className={styles.valueDisplayContent}>
				{typeShowing === 'saturation' ?
					Math.round(saturation * 100) + '%' :
					Math.round(hueToDegrees(hue)) + '°'
				}
			</div>
			<div className={styles.valueDisplayHeader}>
				{typeShowing === 'saturation' ? 'Saturation' : 'Hue'}
			</div>
		</div>
	)
}

function getAngleOffset(x0, y0, x, y, top, left, width, height) {
	// Make coordinates relative to component:
	x0 -= left
	x -= left
	y0 -= top
	y -= top

	// Center of component is (0, 0):
	x0 -= width / 2
	x -= width / 2
	y0 -= height / 2
	y -= height / 2

	// Flip y-axis so positive is up:
	y0 *= -1
	y *= -1

	const initialAngleCW = Math.atan2(y0, x0)
	const currentAngleCW = Math.atan2(y, x)

	const angleOffsetCW = currentAngleCW - initialAngleCW
	return angleOffsetCW
}

function radiansToHue(radians) {
	return radians * (255 / (2 * Math.PI))
}

function hueToRadians(hue) {
	return hue * ((2 * Math.PI) / 255)
}

function hueToDegrees(hue) {
	return hue * (360 / 255)
}


export default ColorPicker
