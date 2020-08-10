import React from 'react'
import { animated, useTransition, config } from 'react-spring'
import styles from './Basic.css'

const BasicModal = ({ isOpen, children }) => {
    const transition = useTransition(isOpen, null, {
        from: { opacity: 0, backdropFilter: 'blur(0px)' },
        enter: { opacity: 1, backdropFilter: 'blur(14px)' },
        leave: { opacity: 0, backdropFilter: 'blur(0px)' },
        config: config.stiff,
    })

    return(
        <>
            {transition.map(({ item, key, props }) => (
                item && 
                    <animated.div
                        key={key}
                        style={props}
                        className={styles.container}
                    >
                        <div className={styles.content}>
                            {children}
                        </div>
                    </animated.div>
            ))}
        </>
    )
}

export default BasicModal