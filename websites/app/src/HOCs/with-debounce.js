import React, { useEffect, useState, useCallback, useRef } from 'react'
import lodash from 'lodash'

//* ----------- PURPOSE -----------
//* This HOC makes the debouncedOnChange
//* fire maximum once per waitMS milliseconds

//* Delays the propagation of value into the
//* state by blockMS milliseconds after last time
//* debouncedOnChange was fired

// Such a debouncing is useful if you have
// your input component's onInput directly bound
// to an API call, and you do not want to fire
// each time the input changes - as this would cause
// way too many API requests.


function withDebounce(InputComponent) {
	// waitMS specifies the minimum # MS between
	// each time debouncedOnInput should fire
	const waitMS = 500


	// blockMS specifies for how long the component
	// should block after firing debouncedOnInput
	// before `value` can propagate down to
	// the raw component. This is particularly
	// useful if it takes long time before an
	// API sends the response of the mutation.

	// Because the DebouncedInputComponent
	// keeps track of the value as local state,
	// this block time can be large without
	// having an impact on the performance
	const blockMS = 4500
	const DebuncedInputComponent = ({
		onInput,
		value: initialValue,
		debouncedOnInput,
		...passThroughProps }) => {

		// previousValue holds the value which
		// was previously emitted using debouncedOnInput

		// This is needed to check if we need to
		// emit again after the waitTimeout
		// has expired
		const [previousValue, setPreviousValue] = useState(initialValue)

		// currentValue holds the raw value,
		// and makes the input responsive
		const [currentValue, setCurrentValue] = useState(initialValue)

		// valueWithSource holds
		// {value: currentValue, source: 'SELF' | 'PARENT'}
		// SELF means that the <InputComponent /> set the value
		// through its `onInput`.
		// PARENT means that the parent manually set the `value` prop
		const [valueWithSource, setValueWithSource] = useState({ value: initialValue, source: 'PARENT' })


		// The value states must be bound to refs because
		// setInterval captures a closure on the variables
		// and thus  would  have utilized old values when
		// it fires:
		const previousValueRef = useRef(previousValue)
		previousValueRef.current = previousValue

		const currentValueRef = useRef(currentValue)
		currentValueRef.current = currentValue


		// Whenever `waitTimeout !== null`,
		// new values are NOT allowed to  be emitted
		// through debouncedOnInput:
		const [waitTimeout, setWaitTimeout] = useState(null)

		// Whenever `blockTimeout === null`,
		// values from the DebouncedInputComponent
		// can propagate down into the raw component
		const [blockTimeout, setBlockTimeout] = useState(null)
		useEffect(() => {
			if (waitTimeout || blockTimeout) return
			if (lodash.isEqual(initialValue, currentValue)) return

			setCurrentValue(initialValue)
			setValueWithSource({ value: initialValue, source: 'PARENT' })
		}, [initialValue, blockTimeout])

		// Do not perform any remaining timeout
		// after unmount:
		useEffect(() => {
			return () => {
				// TODO: Maybe emit latest value on unmount?
				if (waitTimeout) window.clearTimeout(waitTimeout)
				if (blockTimeout) window.clearTimeout(blockTimeout)
			}
		}, [])

		const emitDebouncedValue = (value) => {
			setWaitTimeout(window.setTimeout(() => {
				// This fires either:
				// 1. every waitMS ms when value input is changed
				//    continuously
				// 2. waitMS ms after last debouncedOnInput, and
				//    some time has passed since last input change

				if (lodash.isEqual(currentValueRef.current, previousValueRef.current)) {
					setBlockTimeout(window.setTimeout(() => {
						setBlockTimeout(null)
					}, blockMS))
					setWaitTimeout(null)
					return
				}

				emitDebouncedValue(currentValueRef.current)
			}, waitMS))

			if (blockTimeout) {
				window.clearTimeout(blockTimeout)
				setBlockTimeout(null)
			}

			setPreviousValue(value)
			debouncedOnInput && debouncedOnInput(value)
		}

		const handleInput = useCallback((newValue) => {
			setCurrentValue(newValue)
			setValueWithSource({ value: newValue, source: 'SELF' })

			// onInput is used as pass-through:
			if (onInput) onInput(newValue)

			if (waitTimeout) return

			// > waitMS has passed since last time debouncedOnInput
			// was called, and so we should emit it again since
			// new value has been received:
			emitDebouncedValue(newValue)
		}, [waitTimeout])

		return (
			<InputComponent
				value={currentValue}
				valueWithSource={valueWithSource}
				onInput={handleInput}
				{...passThroughProps}
			/>
		)
	}
	DebuncedInputComponent.displayName = `WithDebounce${InputComponent.displayName || InputComponent.name || 'Component'}`
	return DebuncedInputComponent
}

export default withDebounce