import React from 'react'
import styles from './Grid.css'

export function Layout({ rows, cols, style, children }) {
	return (
		<div
			className={styles.layout}
			style={{
				...style,
				gridTemplateRows: `repeat(${rows || 1}, 1fr)`,
				gridTemplateColumns: `repeat(${cols || 1}, 1fr)`,
			}}
		>
			{children}
		</div>
	)
}

export function Item({ rows, cols, style, children }) {
	return (
		<div
			className={styles.item}
			style={{
				...style,
				gridRowEnd: `span ${rows || 1}`,
				gridColumnEnd: `span ${cols || 1}`
			}}
		>
			<div className={styles.itemWrapper}>{children}</div>
		</div>	
	)
}