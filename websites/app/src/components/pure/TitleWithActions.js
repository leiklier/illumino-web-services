import React, { useState, useMemo } from 'react'
import { useSpring, animated, config } from 'react-spring'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import useDimensions from '../../hooks/use-dimensions'
import styles from './TitleWithActions.css'

const TitleWithActions = ({ actions, children }) => {
	const [actionsAreShown, setActionsAreShown] = useState(false)

	const [iconRef, { width: iconWidth }] = useDimensions()


	const actionsContainerWidth = useMemo(() => {
		if (!iconWidth) return 0

		return actionsAreShown ?
			(actions.length + 1) * iconWidth :
			2 * iconWidth
	}, [actionsAreShown, iconWidth, actions])

	const actionsContainerStyle = useSpring({
		to: { width: actionsContainerWidth + 'px' },
		config: config.gentle,
	})


	return (
		<div className={styles.container}>
			<div className={styles.text}>{children}</div>
			<animated.div
				style={actionsContainerStyle}
				className={styles.actionsContainer}
			>
				<div ref={iconRef} className={styles.action} key="actionsToggle">
					{
						actionsAreShown ?
							<FaChevronRight
								onClick={() => setActionsAreShown(!actionsAreShown)}
								size={32}
							/> :
							<FaChevronLeft
								onClick={() => setActionsAreShown(!actionsAreShown)}
								size={32}
							/>
					}

				</div>
				{actions.map(({ Icon, execute, name }) => (
					<div className={styles.action} key={name}>
						<Icon onClick={execute} size={32} />
					</div>
				))}
			</animated.div>
		</div>
	)
}

export default TitleWithActions
