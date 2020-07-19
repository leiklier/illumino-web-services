import React, { useEffect, useMemo, useState } from 'react'
import { animated, useSprings, useSpring } from 'react-spring'
import {
    BsArrowUpRight,
    BsArrowDownRight,
    BsArrowDownLeft,
    BsArrowUpLeft,
} from 'react-icons/bs'
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

    const numbering = useMemo(() => {
        // Find rotation ( CW / CCW ):
        let isCW = false
        if(
            value.dimensions.top && value.dimensions.right && 
            value.dimensions.bottom && value.dimensions.left
        ) {
            isCW = true
        } else {
            switch(value.startCorner) {
                case 'topRight': isCW = Boolean(value.dimensions.right); break
                case 'bottomRight': isCW = Boolean(value.dimensions.bottom); break
                case 'bottomLeft': isCW = Boolean(value.dimensions.left); break
                case 'topLeft': isCW = Boolean(value.dimensions.top); break
            }
        }

        // Find out which side we are beginning at (which side should be nr. 1):
        let sideBeginningAt = 'top'
        switch(value.startCorner) {
            case 'topRight': sideBeginningAt = isCW ? 'right' : 'top'; break
            case 'bottomRight': sideBeginningAt = isCW ? 'bottom' : 'right'; break
            case 'bottomLeft': sideBeginningAt = isCW ? 'left' : 'bottom'; break
            case 'topLeft': sideBeginningAt = isCW ? 'top' : 'left'; break
        }

        // Add all sides available to an array sorted in right order:
        let orderInitial = []
        value.dimensions.top && orderInitial.push('top')
        value.dimensions.right && orderInitial.push('right')
        value.dimensions.bottom && orderInitial.push('bottom')
        value.dimensions.left && orderInitial.push('left')
        if(!isCW) orderInitial.reverse() // ( executes in-place )

        // Create an array where first element is the side which should be nr. 1
        let order = []
        for(let count = 0; count < orderInitial.length; ++count) {
            const idx = (orderInitial.indexOf(sideBeginningAt) + count) % orderInitial.length
            order.push(orderInitial[idx])
        }

        // Return an object on this form: { [side]: number }
        return order.reduce((obj, value, index) => ({
            ...obj,
            [value]: index + 1
        }), {})
    }, [value])

    function numberingToColor(numbering) {
        switch(numbering) {
            case 1: return 'rgb(250, 81, 81)'   // RED
            case 2: return 'rgb(62, 255, 62)'   // GREEN
            case 3: return 'rgb(71, 71, 252)'   // BLUE
            case 4: return 'rgb(255, 255, 110)' // YELLOW

            default: return 'rgba(255, 255, 255, 0.7)'
        }
    }

    const [previewStyle, previewCircleStyle] = useSprings(2, [
        // previewStyle
        {
            borderTopColor: valueHasChanged ? 
                                numberingToColor(numbering['top']) :
                                'rgba(255, 255, 255, 0.7)', // white
            borderRightColor: valueHasChanged ? 
                                numberingToColor(numbering['right']) :
                                'rgba(255, 255, 255, 0.7)', // white
            borderBottomColor: valueHasChanged ? 
                                numberingToColor(numbering['bottom']) :
                                'rgba(255, 255, 255, 0.7)', // white
            borderLeftColor: valueHasChanged ? 
                                numberingToColor(numbering['left']) :
                                'rgba(255, 255, 255, 0.7)', // white   
        },
        // previewCircleStyle
        { opacity: valueHasChanged ? 1 : 0 },
    ])


    return (
        <div className={styles.container}>
            <div className={styles.outside}>
                <StartCornerButton
                    corner="topLeft"
                    startCorner={value.startCorner}
                    dimensions={value.dimensions}
                    onClick={() => onInput({
                        ...value,
                        startCorner: 'topLeft'
                    })}
                />
                <div
                    style={{ visibility: value.dimensions.top ?
                        'visibile' : 'hidden'
                    }}
                    className={styles.input__horizontal}
                    >
                    <SelectInput
                        font="seven-segment"
                        value={value.dimensions.top}
                        options={options}
                        onInput={newTopValue => onInput({
                            ...value,
                            dimensions: {
                                ...value.dimensions,
                                top: newTopValue,
                            },
                        })}
                        />
                </div>
                <StartCornerButton
                    corner="topRight"
                    startCorner={value.startCorner}
                    dimensions={value.dimensions}
                    onClick={() => onInput({
                        ...value,
                        startCorner: 'topRight'
                    })}
                />
            </div>
            <div className={styles.middle}>
                <div
                    style={{ visibility: value.dimensions.left ?
                            'visibile' : 'hidden'
                    }}
                    className={styles.input__vertical}
                >
                    <SelectInput
                        font="seven-segment"
                        value={value.dimensions.left}
                        options={options.slice().reverse()}
                        onInput={newLeftValue => onInput({
                            ...value,
                            dimensions: {
                                ...value.dimensions,
                                left: newLeftValue,
                            },
                        })}
                        vertical
                    />
                </div>
                <animated.div
                    style={{
                        ...previewStyle,
                        borderTopStyle: value.dimensions.top ? 'solid' : 'hidden',
                        borderRightStyle: value.dimensions.right ? 'solid' : 'hidden',
                        borderBottomStyle: value.dimensions.bottom ? 'solid' : 'hidden',
                        borderLeftStyle: value.dimensions.left ? 'solid' : 'none',

                        borderTopRightRadius: value.dimensions.top && value.dimensions.right ?
                                                '1rem' : 0,
                        borderBottomRightRadius: value.dimensions.bottom && value.dimensions.right ?
                                                '1rem' : 0,
                        borderBottomLeftRadius: value.dimensions.bottom && value.dimensions.left ?
                                                '1rem' : 0,
                        borderTopLeftRadius: value.dimensions.top && value.dimensions.left ?
                                                '1rem' : 0,

                    }}
                    className={styles.preview}
                >
                    {value.dimensions.top ?
                        <animated.div
                            style={previewCircleStyle}
                            className={styles.previewCircle+' '+styles.previewCircle__top}
                        >
                            {numbering['top']}
                        </animated.div> : ''
                    }
                    {value.dimensions.right ?
                        <animated.div
                            style={previewCircleStyle}
                            className={styles.previewCircle+' '+styles.previewCircle__right}
                        >
                            {numbering['right']}
                        </animated.div> : ''
                    }
                    {value.dimensions.bottom ?
                        <animated.div
                            style={previewCircleStyle}
                            className={styles.previewCircle+' '+styles.previewCircle__bottom}
                        >
                            {numbering['bottom']}
                        </animated.div> : ''
                    }
                    {value.dimensions.left ?
                        <animated.div
                            style={previewCircleStyle}
                            className={styles.previewCircle+' '+styles.previewCircle__left}
                        >
                            {numbering['left']}
                        </animated.div> : ''
                    }
                    <div className={styles.ledStripName}>{ ledStripName }</div>
                    <div className={styles.instructions}>
                        {valueHasChanged ?
                            'Adjust in specified order.' :
                            'Specify number of LEDs.'
                        }
                    </div>
                </animated.div>

                <div
                    style={{ visibility: value.dimensions.right ?
                            'visibile' : 'hidden'
                    }}
                    className={styles.input__vertical}
                >
                    <SelectInput
                        font="seven-segment"
                        value={value.dimensions.right}
                        options={options.slice().reverse()}
                        onInput={newRightValue => onInput({
                            ...value,
                            dimensions: {
                                ...value.dimensions,
                                right: newRightValue,
                            },
                        })}
                        vertical
                    />
                </div>
            </div>
            <div className={styles.outside}>
                <StartCornerButton
                    corner="bottomLeft"
                    startCorner={value.startCorner}
                    dimensions={value.dimensions}
                    onClick={() => onInput({
                        ...value,
                        startCorner: 'bottomLeft'
                    })}
                />
                <div
                    style={{ visibility: value.dimensions.bottom ?
                            'visibile' : 'hidden'
                    }}
                    className={styles.input__horizontal}
                >
                    <SelectInput
                        font="seven-segment"
                        value={value.dimensions.bottom}
                        options={options}
                        onInput={newBottomValue => onInput({
                            ...value,
                            dimensions: {
                                ...value.dimensions,
                                bottom: newBottomValue,
                            },
                        })}
                    />
                </div>
                <StartCornerButton
                    corner="bottomRight"
                    startCorner={value.startCorner}
                    dimensions={value.dimensions}
                    onClick={() => onInput({
                        ...value,
                        startCorner: 'bottomRight'
                    })}
                />
            </div>
        </div>
    )
}

function StartCornerButton({ dimensions, corner, startCorner, onClick }) {
    const { vertical, horizontal } = useMemo(() => {
        // { vertical: 'top' / 'bottom', horizontal: 'left' / 'right' }:
        const [vertical, horizontal] = corner.split(/(?=[A-Z])/).map(v => v.toLowerCase())
        return { vertical, horizontal }
    }, [corner])

    const isVisible = useMemo(() => {
        if(dimensions.top && dimensions.right &&
            dimensions.bottom && dimensions.left) return true

        if(dimensions[vertical] && !dimensions[horizontal]) return true
        if(dimensions[horizontal] && !dimensions[vertical]) return true
        
        return false
    }, [dimensions, vertical, horizontal])

    const Icon = useMemo(() => {
        switch(corner) {
            case 'topRight': return BsArrowDownLeft
            case 'bottomRight': return BsArrowUpLeft
            case 'bottomLeft': return BsArrowUpRight
            case 'topLeft': return BsArrowDownRight
        }
    }, [corner])

    const style = useSpring({
        color: corner === startCorner ? 'rgba(250, 81, 81, 1)' : 'rgba(255, 255, 255, 0.3)'
    })
    return (
        <animated.div
            onClick={onClick}
            style={{
                ...style,
                visibility: isVisible ? 'visible' : 'hidden',
                flexDirection: horizontal === 'right' ? 'row' : 'row-reverse',
            }}
            className={styles.startCornerButton}
        >
            <div 
                style={{
                    alignSelf: vertical === 'bottom' ? 'flex-start' : 'flex-end',
                }}
            >
                <Icon size={24}/>
            </div>
            <div className={styles.startCornerButtonText}>START</div>
        </animated.div>
    )
}

export default LedStripGeometryInput