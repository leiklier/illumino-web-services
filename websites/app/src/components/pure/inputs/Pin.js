import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import styles from './Pin.css'

function PinInput({ className, pinLength, onInput, onCancel }) {
	const [pin, setPin] = useState(
		Array.apply(null, Array(pinLength)).map(function() {}),
	)

	function pinArrayToString(pinArray) {
		let pinString = ''
		for (const number of pinArray) {
			if (typeof number !== 'number') continue
			pinString += number.toString()
		}
		return pinString
	}

	function addNumberToPin(number) {
		const pinCopy = [...pin]
		for (const index in pinCopy) {
			const currentNumber = pinCopy[index]
			if (typeof currentNumber !== 'number') {
				pinCopy[index] = number
				setPin(pinCopy)
				break
			}
		}
	}

	function removeLastNumberFromPin() {
		const pinCopy = [...pin]
		for (const index in pinCopy) {
			const currentNumber = pinCopy[pinCopy.length - 1 - index]
			if (typeof currentNumber === 'number') {
				pinCopy[pinCopy.length - 1 - index] = null
				setPin(pinCopy)
				break
			}
		}
	}

	function clearPin() {
		setPin(Array.apply(null, Array(pinLength)).map(function() {}))
	}

	function handleInput(input) {
		if (input === -1) removeLastNumberFromPin()
		else addNumberToPin(input)
	}

	useEffect(() => {
		if (pinArrayToString(pin).length === pinLength) {
			onInput(pinArrayToString(pin))
			clearPin()
		}
	}, [pin])

	return (
		<div
			className={classNames({
				[styles.pinInput]: true,
				[className]: className,
			})}
		>
			<PinPreview pin={pin} />
			<PinPads
				onInput={handleInput}
				isEmpty={!Boolean(pinArrayToString(pin).length)}
			/>
		</div>
	)
}

function PinPreview({ pin }) {
	return (
		<div className={styles.pinPreview}>
			{pin.map((number, i) => (
				<PinPreviewCircle key={i} isFilled={typeof number === 'number'} />
			))}
		</div>
	)
}

function PinPreviewCircle({ isFilled }) {
	return (
		<div
			className={classNames({
				[styles.pinPreviewCircle]: true,
				[styles.pinPreviewCircleFilled]: isFilled,
			})}
		/>
	)
}

function PinPads({ isEmpty, onInput, onCancel }) {
	return (
		<>
			<PinPad key={1} number={1} characters="" onClick={() => onInput(1)} />
			<PinPad key={2} number={2} characters="ABC" onClick={() => onInput(2)} />
			<PinPad key={3} number={3} characters="DEF" onClick={() => onInput(3)} />

			<PinPad key={4} number={4} characters="GHI" onClick={() => onInput(4)} />
			<PinPad key={5} number={5} characters="JKL" onClick={() => onInput(5)} />
			<PinPad key={6} number={6} characters="MNO" onClick={() => onInput(6)} />

			<PinPad key={7} number={7} characters="PQRS" onClick={() => onInput(7)} />
			<PinPad key={8} number={8} characters="TUV" onClick={() => onInput(8)} />
			<PinPad key={9} number={9} characters="WXYZ" onClick={() => onInput(9)} />

			<div key="fill"></div>
			<PinPad key={0} number={0} characters="" onClick={() => onInput(0)} />
			<div
				className={styles.pinActionButton}
				key="delete"
				onClick={() => onInput(-1)}
			>
				{isEmpty ? 'cancel' : 'delete'}
			</div>
		</>
	)
}

function PinPad({ number, characters, onClick }) {
	return (
		<div onClick={onClick} className={styles.pinPad}>
			<div className={styles.pinPadNumber}>
				<span>{number}</span>
			</div>
			<div className={styles.pinPadCharacters}>
				<span>{characters}</span>
			</div>
		</div>
	)
}

export default PinInput
