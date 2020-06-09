import React from 'react'
import styles from './Semantic.css'

export function Layout({children, ...passthroughProps}) {
    return(
        <div className={styles.layout} {...passthroughProps}>
            {children}
        </div>
    )
}

export function Header({children, ...passthroughProps}) {
    return(
        <div className={styles.header} {...passthroughProps}>
            {children}
        </div>
    )
}

export function Main({children, ...passthroughProps}) {
    return(
        <div className={styles.main} {...passthroughProps}>
            {children}
        </div>
    )
}

export function Footer({children, ...passthroughProps}) {
    return(
        <div className={styles.footer} {...passthroughProps}>
            {children}
        </div>
    )
}