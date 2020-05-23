import React, { useEffect, useState } from 'react'
import lodash from 'lodash'

//* ----------- PURPOSE -----------
//* This HOC makes the debouncedOnChange
//* fire maximum once per waitMS milliseconds

// Such a debouncing is useful if you have
// your input component's onInput directly bound
// to an API call, and you do not want to fire
// each time the input changes - as this would cause
// way too many API requests.

// There exists many solutions to this problem,
// but no HOC was found, and this solution does also
// emit the value after input has stopped changing.
// So you are guaranteed that whatever is the value
// of the input is emitted `waitMS` after last emit
// ----------------------------------

function withDebounce(InputComponent) {
	// waitMS specifies the minimum #MS between
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

		// Whenever `waitTimeout !== null`,
		// new values are not emitted through debouncedOnInput:
		const [waitTimeout, setWaitTimeout] = useState(null)

		// Whenever `blockTimeout === null`,
		// values from the DebouncedInputComponent
		// can propagate down into the raw component
		const [blockTimeout, setBlockTimeout] = useState(null)
		const [valueWasFromProps, setValueWasFromProps] = useState(false)
		useEffect(() => {
			if (waitTimeout || blockTimeout) return
			if (lodash.isEqual(initialValue, currentValue)) return

			setValueWasFromProps(true)
			setCurrentValue(initialValue)
		}, [initialValue, blockTimeout])

		// Do not perform any remaining timeout
		// after unmount:
		useEffect(() => {
			return () => {
				if (waitTimeout) window.clearTimeout(waitTimeout)
				if (blockTimeout) window.clearTimeout(blockTimeout)
			}
		}, [])

		// Run each time onInput from
		// InputComponent fires:
		useEffect(() => {
			if (valueWasFromProps) {
				// the state change did NOT come from
				// onInput, and so do not perform
				// side-effects:
				setValueWasFromProps(false)
				return
			}

			// onInput is used as pass-through:
			if (onInput) onInput(currentValue)

			if (waitTimeout) return

			// > waitMS has passed since last time debouncedOnInput
			// was called, and so we should emit it again since
			// new value has been received:
			emitDebouncedValue()
		}, [currentValue])

		useEffect(() => {
			if (waitTimeout) return

			// the waitTimeout has just expired,
			// so we need to start a blockTimeout:
			if (blockTimeout) window.clearTimeout(blockTimeout)
			setBlockTimeout(window.setTimeout(() => {
				setBlockTimeout(null)
			}, blockMS))
		}, [waitTimeout])

		useEffect(() => {
			if (waitTimeout) return
			if (lodash.isEqual(currentValue, previousValue)) return

			// Value has changed since last debouncedOnInput,
			// and the waitTimeout has expired, so we need
			// to rerun:
			emitDebouncedValue()

		}, [waitTimeout])

		function emitDebouncedValue() {
			setWaitTimeout(window.setTimeout(() => {
				// This fires either:
				// 1. every 250 ms when value input is changed
				//    continuously
				// 2. 250 ms after last debouncedOnInput, and
				//    some time has passed since last input change

				setWaitTimeout(null)
			}, waitMS))

			setPreviousValue(currentValue)
			debouncedOnInput && debouncedOnInput(currentValue)
		}

		return (
			<InputComponent
				value={currentValue}
				onInput={setCurrentValue}
				{...passThroughProps}
			/>
		)
	}
	DebuncedInputComponent.displayName = `WithDebounce${InputComponent.displayName || InputComponent.name || 'Component'}`
	return DebuncedInputComponent
}

export default withDebounce