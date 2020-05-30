// expandDotkeyedObject takes in an object
// in which its keys follow the dot notation, e.g.
// 'foo.bar.0.foo' instead of being a nested object.
// It returns the nested version of the object

// Example:
// { 'ledStrips.0.brightness': 0.5216498465714235 }
// becomes
// { ledStrips: { '0': { brightness: 0.5216498465714235 } } }

function expandDotkeyedObject(dotKeyedObject) {
	function expandNestedObject(object, keys, value) {
		if (keys.length === 1) {
			return object[keys[0]] = value
		}

		const key = keys.shift()
		if (typeof object[key] !== 'object' || object[key] === null) {
			object[key] = {}
		}

		return expandNestedObject(object[key], keys, value)
	}

	const nestedObject = {}
	for (dotKey in dotKeyedObject) {
		const value = dotKeyedObject[dotKey]
		let keys = dotKey.split('.')
		expandNestedObject(nestedObject, keys, value)
	}

	return nestedObject
}

module.exports = {
	expandDotkeyedObject,
}