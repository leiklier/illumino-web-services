const keepOnlyAlphaNumeric = string => {
	if (typeof string !== 'string') return ''
	return string.replace(/[^a-z0-9]/gi, '')
}

module.exports = {
	keepOnlyAlphaNumeric,
}
