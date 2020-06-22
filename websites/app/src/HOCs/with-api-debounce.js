import React, { useEffect, useState } from 'react'
import lodash from 'lodash'

function withApiDebounce(InputComponent) {
    const DebouncedInput = ({
        onInput,
        value: valueFromProps,
        debouncedOnInput,
        isCommiting,
        ...passThroughProps
    }) => {

        const [previousValue, setPreviousValue] = useState(valueFromProps)
        const [currentValue, setCurrentValue] = useState(valueFromProps)
        const [valueWithSource, setValueWithSource] = useState({
            value: valueFromProps,
            source: 'PARENT',
        })

        useEffect(() => {
            if(isCommiting) return
            
            setCurrentValue(valueFromProps)
            setValueWithSource({ value: valueFromProps, source: 'PARENT' })
        }, [valueFromProps])

        useEffect(() => {
            if(isCommiting) return
            // Falling edge of `isCommiting`:
            if(lodash.isEqual(currentValue, previousValue)) return
            emitDebouncedValue(currentValue)
        }, [isCommiting])

        function emitDebouncedValue(value) {
            setPreviousValue(value)
            debouncedOnInput(value)
        }

        function handleInput(newValue) {
            setCurrentValue(newValue)
            setValueWithSource({ value: newValue, source: 'SELF' })

            if(isCommiting) return
            emitDebouncedValue(newValue)
        }

        return (
            <InputComponent
                value={currentValue}
                valueWithSource={valueWithSource}
                onInput={handleInput}
                {...passThroughProps}
            />
        )
    }

    DebouncedInput.displayName = `WithApiDebounce${InputComponent.displayName || InputComponent.name || 'Component'}`
    return DebouncedInput
}

export default withApiDebounce