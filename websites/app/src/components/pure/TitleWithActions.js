import React, { useState, useMemo } from 'react'
import { useSpring, animated, config } from 'react-spring'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
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
					<FontAwesomeIcon
						onClick={() => setActionsAreShown(!actionsAreShown)}
						icon={actionsAreShown ? faChevronRight : faChevronLeft}
						size="2x"
					/>
				</div>
				{actions.map(action => (
					<div className={styles.action} key={action.name}>
						<FontAwesomeIcon
							icon={action.icon}
							onClick={action.execute}
							size="2x"
						/>
					</div>
				))}
			</animated.div>
		</div>
	)
}

export default TitleWithActions
