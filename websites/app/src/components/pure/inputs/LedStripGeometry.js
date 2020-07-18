import React, { useEffect, useState } from 'react'
import { animated, useSprings } from 'react-spring'
import SelectInput from './Select'
import styles from './LedStripGeometry.css'

const LedStripGeometryInput = ({ ledStripName, value, onInput }) => {
    const options = [...Array(200).keys()].map(value => ({
		name: value,
		value: value,
    }))
    
    const [valueHasChanged, setValueHasChanged] = useState(false)
    useEffect(() => {
        setValueHasChanged(true)
        const timeoutId = window.setTimeout(() => {
            setValueHasChanged(false)
        }, 10 * 1000)
        return () => window.clearTimeout(timeoutId)
    }, [value])

    const [previewStyle, previewCircleStyle] = useSprings(2, [
        // previewStyle
        {
            borderTopColor: valueHasChanged ? 
                                'rgb(71, 71, 252)' : // BLUE
                                'rgba(255, 255, 255, 0.7)', // white
            borderRightColor: valueHasChanged ? 
                                'rgb(255, 255, 110)' : // YELLOW
                                'rgba(255, 255, 255, 0.7)', // white
            borderBottomColor: valueHasChanged ? 
                                'rgb(62, 255, 62)' : // GREEN
                                'rgba(255, 255, 255, 0.7)', // white
            borderLeftColor: valueHasChanged ? 
                                'rgb(250, 81, 81)' : // GREEN
                                'rgba(255, 255, 255, 0.7)', // white   
        },
        // previewCircleStyle
        { opacity: valueHasChanged ? 1 : 0 },
    ])


    return (
        <div className={styles.container}>
            <div className={styles.input__horizontal}>
                <SelectInput
                    font="seven-segment"
                    value={value.TOP}
                    options={options}
                    onInput={newTopValue => onInput({
                        ...value,
                        TOP: newTopValue,
                    })}
                />
            </div>
            <div className={styles.middle}>
                <div className={styles.input__vertical}>
                    <SelectInput
                        font="seven-segment"
                        value={value.LEFT}
                        options={options.slice().reverse()}
                        onInput={newLeftValue => onInput({
                            ...value,
                            LEFT: newLeftValue,
                        })}
                        vertical
                    />
                </div>
                <animated.div style={previewStyle} className={styles.preview}>
                    <animated.div
                        style={previewCircleStyle}
                        className={styles.previewCircle+' '+styles.previewCircle__top}
                    >
                        1
                    </animated.div>
                    <animated.div
                        style={previewCircleStyle}
                        className={styles.previewCircle+' '+styles.previewCircle__right}
                    >
                        2
                    </animated.div>
                    <animated.div
                        style={previewCircleStyle}
                        className={styles.previewCircle+' '+styles.previewCircle__bottom}
                    >
                        3
                    </animated.div>
                    <animated.div
                        style={previewCircleStyle}
                        className={styles.previewCircle+' '+styles.previewCircle__left}
                    >
                        4
                    </animated.div>

                    <div className={styles.ledStripName}>{ ledStripName }</div>
                    <div className={styles.instructions}>
                        {valueHasChanged ?
                            'Adjust in specified order.' :
                            'Specify number of LEDs.'
                        }
                    </div>
                </animated.div>

                <div className={styles.input__vertical}>
                    <SelectInput
                        font="seven-segment"
                        value={value.RIGHT}
                        options={options.slice().reverse()}
                        onInput={newRightValue => onInput({
                            ...value,
                            RIGHT: newRightValue,
                        })}
                        vertical
                    />
                </div>
            </div>
            <div className={styles.input__horizontal}>
                <SelectInput
                    font="seven-segment"
                    value={value.BOTTOM}
                    options={options}
                    onInput={newBottomValue => onInput({
                        ...value,
                        BOTTOM: newBottomValue,
                    })}
                />
            </div>
        </div>
    )
}

export default LedStripGeometryInput