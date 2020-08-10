import React, { useMemo } from 'react'
import { animated, useSprings} from 'react-spring'
import useDimensions from '../../../hooks/use-dimensions'
import styles from './MultiToggle.css'


function MultiToggle({ options, value, onInput }) {
    const [optionsRef, { width: optionsWidth }] = useDimensions()
    
    const valueIndex = useMemo(() => {
        console.log(optionsWidth)
        const idx = options.findIndex(option => option.value === value)
        return idx
    }, [options, value])

    const springs = useSprings(2, [
        // Let button move when selecting another value:
        {
            left: optionsWidth ? 
                (valueIndex/options.length) * optionsWidth + 'px':
                '0px',
        },
        // Keep the options inside the button at the same position:
        {
            transform: `translateX(-${
                optionsWidth ? (valueIndex/options.length) * optionsWidth : 0
            }px)`
        }
    ])

    return (
        <div className={styles.container}>
            <div
                ref={optionsRef}
                className={styles.optionsContainer}
            >
                {options.map(({ name, value }) => (
                    <div
                        key={value}
                        onClick={() => onInput(value)}
                        className={styles.option}
                    >
                        { name }
                    </div>
                ))}
            </div>

            <animated.div
                style={{
                    ...springs[0],
                    width: `calc(${(1/options.length)*100}% - 0.22rem)`
                }}
                className={styles.buttonContainer}
            >
                {options.map(({ name, value }) => (
                    <animated.div
                        key={value}
                        style={springs[1]}
                        className={styles.option}
                    >
                        { name }
                    </animated.div>
                ))}
                
            </animated.div>
        </div>
    )
}

export default MultiToggle