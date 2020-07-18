import React from 'react'
import styles from './Basic.css'

const BasicModal = ({children}) => {
    return(
        <div className={styles.container}>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}

export default BasicModal