import React from 'react'
import classNames from 'classnames'
import styles from './CircularButton.css'

const CircularButton = ({ Icon, iconColor, value, onClick, type }) => {
	return (
		<div className={styles.container}>
			<div
				className={classNames({
					[styles.button]: true,

					[styles.buttonGhostIfOff]: !value && type === 'ghost',
					[styles.buttonGhostIfOn]: value && type === 'ghost',

					[styles.buttonDefaultIfOff]: !value && type !== 'ghost',
					[styles.buttonDefaultIfOn]: value && type !== 'ghost',
				})}
				style={iconColor && value ? { color: iconColor } : {}}
				onClick={() => onClick && onClick(!value)}
			>
				{type === 'ghost' ?
					<svg className={styles.lineThrough} viewBox="0 0 100 100">
						<line x1="0" y1="100" x2="100" y2="0" style={{ stroke: 'rgb(255,255,255, 0.6)', strokeWidth: 4 }} />
					</svg> : ''
				}
				<Icon size={48} />
			</div>
		</div>
	)
}

export default CircularButton
