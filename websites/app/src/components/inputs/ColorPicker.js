import React, { useState } from 'react'
import styles from './ColorPicker.css'
import { useDrag } from 'react-use-gesture'
import useDimensions from '../../hooks/use-dimensions'

const ColorPicker = () => {

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<ColorWheel />
			</div>
		</div>
	)
}

function ColorWheel() {
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
	const [rotationCW, setRotationCW] = useState(0)
	const [ref, { y: top, x: left, width, height }] = useDimensions()

	const bindDrag = useDrag(({ previous: [x0, y0], xy: [x, y] }) => {
		if (!isTouching) return
		const angleOffsetCW = getAngleOffset(x0, y0, x, y, top, left, width, height)
		const newAngleCW = (rotationCW + angleOffsetCW) % (2 * Math.PI)
		setRotationCW(newAngleCW)
	})

	const [isTouching, setIsTouching] = useState(false)

	return (
		<svg
			className={styles.colorWheel}
			viewBox={`0 0 ${svg.width} ${svg.height}`}
			xmlns="http://www.w3.org/2000/svg"
			{...bindDrag()} ref={ref}
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
		</svg>
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

export default ColorPicker
