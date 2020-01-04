import React from 'react'
import styles from './ColorPicker.css'

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

	return (
		<svg
			className={styles.colorWheel}
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
			/>
		</svg>
	)
}

export default ColorPicker
